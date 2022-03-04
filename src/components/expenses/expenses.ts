import { pluckCurrentTargetValue, useObservable, useObservableCallback } from 'observable-hooks'
import { ChangeEvent, useMemo } from 'react'
import {
	concatAll,
	debounce,
	distinctUntilChanged,
	filter,
	identity,
	map,
	mapTo,
	Observable,
	scan,
	shareReplay,
	startWith,
	switchMap,
	timer,
} from 'rxjs'
import API, { Expense } from 'services/api'
import { Resource, resourceFrom } from 'util/resource'

export type Meta = {
	origins: string[]
	people: string[]
}

type UseExpenses = {
	addExpenseModalState$: Observable<AddExpenseModalState>
	search$: Observable<string>
	expenses$: Observable<Expense[]>
	filteredExpenses$: Observable<Expense[]>
	meta$: Observable<Meta>

	onAddExpenseModalEvent(event: AddExpenseModalEvent): void
	onSearchChange(event: ChangeEvent<HTMLInputElement>): void
}

export function useExpenses(): UseExpenses {
	const api = useMemo(() => new API(), [])

	const [onAddExpenseModalEvent, addExpenseModalState$, added$] = useAddExpenseModal(api)

	const [onSearchChange, search$] = useObservableCallback<string, ChangeEvent<HTMLInputElement>>((events$) =>
		events$.pipe(pluckCurrentTargetValue)
	)

	const expenses$ = useObservable(() =>
		api.list().pipe(
			switchMap((expenses) =>
				added$.pipe(
					concatAll(),
					scan((expenses, resource) => {
						switch (resource.state) {
							case 'pending':
								return [resource.pending, ...expenses]
							case 'fulfilled':
								return [resource.data, ...expenses.slice(1)]
							case 'rejected':
								return expenses.slice(1)
						}
					}, expenses),
					startWith(expenses)
				)
			),
			shareReplay(1)
		)
	)

	const filteredExpenses$ = useObservable(() =>
		expenses$.pipe(
			switchMap((expenses) =>
				search$.pipe(
					debounce(() => timer(500)),
					startWith(''),
					map((search) => search.toLowerCase()),
					map((search) =>
						expenses.filter((e) =>
							[e.origin, e.description, `$${e.amount / 100}`, e.charged]
								.map((s) => s.toLowerCase())
								.find((s) => s.indexOf(search) > -1)
						)
					)
				)
			)
		)
	)

	const meta$ = useObservable(() =>
		expenses$.pipe(
			map((expenses) => {
				const origins = new Set<string>()
				const people = new Set<string>()
				expenses.forEach(({ origin, charged }) => {
					origins.add(origin)
					people.add(charged)
				})

				return {
					origins: Array.from(origins),
					people: Array.from(people),
				}
			})
		)
	)

	return { addExpenseModalState$, search$, expenses$, filteredExpenses$, meta$, onAddExpenseModalEvent, onSearchChange }
}

type AddExpenseModalSubmitEvent = {
	type: 'submit'
	origin: string
	description: string
	amount: number
	charged: string
}
export type AddExpenseModalEvent = { type: 'open' } | { type: 'cancel' } | AddExpenseModalSubmitEvent
export type AddExpenseModalState = { type: 'closed' } | { type: 'open' } | { type: 'submitting' }

function useAddExpenseModal(
	api: API
): [
	(event: AddExpenseModalEvent) => void,
	Observable<AddExpenseModalState>,
	Observable<Observable<Resource<Expense, Expense>>>
] {
	type Event = AddExpenseModalEvent
	type State = AddExpenseModalState

	const [onEvent, events$] = useObservableCallback<Event>(identity)

	const added$ = useObservable(() =>
		events$.pipe(
			filter((event): event is AddExpenseModalSubmitEvent => event.type === 'submit'),
			map(({ origin, description, amount, charged }) => {
				const pending: Expense = {
					id: 'pending',
					createdAt: new Date(),
					origin,
					description,
					amount,
					charged,
				}

				return resourceFrom(api.add({ origin, description, amount, charged }), pending)
			}),
			shareReplay(1)
		)
	)

	const state$ = useObservable(() =>
		added$.pipe(
			concatAll(),
			filter((resource) => resource.state === 'fulfilled' || resource.state === 'rejected'),
			mapTo(true),
			startWith(true),
			switchMap(() =>
				events$.pipe(
					scan<Event, State>(
						(state, event) => {
							switch (event.type) {
								case 'open':
									if (state.type === 'closed') {
										return { type: 'open' }
									}
									break
								case 'cancel':
									if (state.type === 'open') {
										return { type: 'closed' }
									}
									break
								case 'submit':
									if (state.type === 'open') {
										return { type: 'submitting' }
									}
									break
							}

							return state
						},
						{ type: 'closed' }
					),
					startWith<State>({ type: 'closed' }),
					distinctUntilChanged()
				)
			)
		)
	)

	return [onEvent, state$, added$]
}

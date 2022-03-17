import {
	Autocomplete,
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	InputAdornment,
	Stack,
	TextField,
} from '@mui/material'
import { pluckCurrentTargetValue, useObservable, useObservableCallback } from 'observable-hooks'
import { ChangeEvent } from 'react'
import { useObservableAndState, useObservableAndStateEager } from 'rx/hooks/observable'
import { combineLatestWith, map, Observable, of, skip, startWith } from 'rxjs'
import { AddExpenseModalEvent, AddExpenseModalState, Meta } from './expenses'

type Event = AddExpenseModalEvent
type State = AddExpenseModalState

type Props = {
	meta$: Observable<Meta>
	state$: Observable<State>

	onEvent(event: Event): void
}

export function AddExpenseModal({ meta$, state$, onEvent }: Props): JSX.Element {
	const isOpen = useObservableAndState(() => state$.pipe(map((state) => state.type === 'open')), false)

	const onClose = () => onEvent({ type: 'cancel' })

	return (
		<Dialog open={isOpen} maxWidth="sm" fullWidth onClose={onClose}>
			{isOpen && <Content meta$={meta$} onEvent={onEvent} onClose={onClose} />}
		</Dialog>
	)
}

type ContentProps = Pick<Props, 'meta$' | 'onEvent'> & {
	onClose(): void
}

function Content({ meta$, onEvent, onClose }: ContentProps) {
	const [origin, origin$, isOriginValid$] = useOrigin(meta$)
	const [description, description$, isDescriptionValid$] = useDescription()
	const [amount, amount$, isAmountValid$] = useAmount()
	const [charged, charged$, isChargedValid$] = useCharged(meta$)

	const isValid$ = useObservable(() =>
		isOriginValid$.pipe(
			combineLatestWith(isDescriptionValid$, isAmountValid$, isChargedValid$),
			map((isValid) => isValid.every((b) => b))
		)
	)

	const submit = useObservableAndStateEager(() =>
		isValid$.pipe(
			combineLatestWith(origin$, description$, amount$, charged$),
			map(([isValid, origin, description, amount, charged]) => {
				if (!isValid) {
					return <Button disabled>Add expense</Button>
				}

				const onSubmit = () =>
					onEvent({
						type: 'submit',
						origin,
						description,
						amount,
						charged,
					})

				return <Button onClick={onSubmit}>Add expense</Button>
			})
		)
	)

	return (
		<>
			<DialogTitle>Add expense</DialogTitle>
			<DialogContent>
				<DialogContentText>Fill in information about the expense</DialogContentText>
				<Box pt={2}>
					<Stack direction="column" spacing={2}>
						{origin}
						{description}
						<Stack direction="row" spacing={2}>
							{amount}
							{charged}
						</Stack>
					</Stack>
				</Box>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Cancel</Button>
				{submit}
			</DialogActions>
		</>
	)
}

function useOrigin(meta$: Observable<Meta>): [JSX.Element, Observable<string>, Observable<boolean>] {
	const [onChange, value$] = useObservableCallback<string, string, [any, string | null]>(
		(events$) => events$.pipe(startWith('')),
		([_, value]) => value || ''
	)

	const isValid$ = useObservable(() => value$.pipe(map((value) => !!value)))

	const origin = useObservableAndStateEager(() =>
		value$.pipe(
			combineLatestWith(
				isValid$.pipe(skip(1), startWith(true)),
				meta$.pipe(
					map((meta) => meta.origins),
					startWith([])
				)
			),
			map(([value, isValid, origins]) => (
				<Autocomplete
					value={value}
					freeSolo
					size="small"
					options={origins}
					renderInput={(params) => <TextField {...params} label="Origin" error={!isValid} />}
					onChange={onChange}
				/>
			))
		)
	)

	return [origin, value$, isValid$]
}

function useDescription(): [JSX.Element, Observable<string>, Observable<boolean>] {
	const [onChange, value$] = useObservableCallback<string, ChangeEvent<HTMLInputElement>>((events$) =>
		events$.pipe(pluckCurrentTargetValue, startWith(''))
	)

	const isValid$ = useObservable(() => of(true))

	const description = useObservableAndStateEager(() =>
		value$.pipe(
			map((value) => <TextField value={value} label="Description" fullWidth size="small" onChange={onChange} />)
		)
	)

	return [description, value$, isValid$]
}

function useAmount(): [JSX.Element, Observable<number>, Observable<boolean>] {
	const [onChange, value$] = useObservableCallback<string, ChangeEvent<HTMLInputElement>>((events$) =>
		events$.pipe(pluckCurrentTargetValue, startWith(''))
	)

	const numberValue$ = useObservable(() =>
		value$.pipe(
			map((value) => parseFloat(value)),
			map((n) => (isNaN(n) ? n : Math.floor(n * 100)))
		)
	)

	const isValid$ = useObservable(() => numberValue$.pipe(map((value) => !isNaN(value) && value > 0)))

	const amount = useObservableAndStateEager(() =>
		value$.pipe(
			combineLatestWith(isValid$.pipe(skip(1), startWith(true))),
			map(([value, isValid]) => (
				<TextField
					value={value}
					label="Amount"
					fullWidth
					size="small"
					error={!isValid}
					InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
					sx={{ flex: 1 }}
					onChange={onChange}
				/>
			))
		)
	)

	return [amount, numberValue$, isValid$]
}

function useCharged(meta$: Observable<Meta>): [JSX.Element, Observable<string>, Observable<boolean>] {
	const [onChange, value$] = useObservableCallback<string, string, [any, string | null]>(
		(events$) => events$.pipe(startWith('')),
		([_, value]) => value || ''
	)

	const isValid$ = useObservable(() => value$.pipe(map((value) => !!value)))

	const charged = useObservableAndStateEager(() =>
		value$.pipe(
			combineLatestWith(
				isValid$.pipe(skip(1), startWith(true)),
				meta$.pipe(
					map((meta) => meta.people),
					startWith([])
				)
			),
			map(([value, isValid, people]) => (
				<Autocomplete
					value={value}
					freeSolo
					size="small"
					options={people}
					renderInput={(params) => <TextField {...params} label="Charged" error={!isValid} />}
					sx={{ flex: 1 }}
					onChange={onChange}
				/>
			))
		)
	)

	return [charged, value$, isValid$]
}

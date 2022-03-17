import { Box, Container } from '@mui/material'
import { ChangeEvent } from 'react'
import { AddExpenseModalEvent, useExpenses } from 'rx/components/expenses/expenses'
import { useObservableAndState } from 'rx/hooks/observable'
import { Expense } from 'rx/services/api'
import { map, mapTo, Observable } from 'rxjs'
import { AddExpenseModal } from './AddExpenseModal'
import ExpensesTable, { ExpensesTableLoading } from './ExpensesTable'
import TopBar, { TopBarLoading } from './TopBar'

export default function Expenses(): JSX.Element {
	const {
		expenses$,
		filteredExpenses$,
		search$,
		meta$,
		addExpenseModalState$,
		onSearchChange,
		onAddExpenseModalEvent,
	} = useExpenses()

	const topBar = useTopBar(expenses$, search$, onSearchChange, onAddExpenseModalEvent)
	const table = useTable(filteredExpenses$)

	return (
		<>
			<Container maxWidth="md" sx={{ py: 3 }}>
				<Box pb={2}>{topBar}</Box>
				{table}
			</Container>
			<AddExpenseModal meta$={meta$} state$={addExpenseModalState$} onEvent={onAddExpenseModalEvent} />
		</>
	)
}

function useTopBar(
	expenses$: Observable<Expense[]>,
	search$: Observable<string>,
	onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void,
	onAddExpenseModalEvent: (event: AddExpenseModalEvent) => void
): JSX.Element {
	return useObservableAndState(
		() =>
			expenses$.pipe(
				mapTo(
					<TopBar search$={search$} onSearchChange={onSearchChange} onAddExpenseModalEvent={onAddExpenseModalEvent} />
				)
			),
		() => <TopBarLoading />
	)
}

function useTable(filteredExpenses$: Observable<Expense[]>): JSX.Element {
	return useObservableAndState(
		() => filteredExpenses$.pipe(map((filteredExpenses) => <ExpensesTable filteredExpenses={filteredExpenses} />)),
		() => <ExpensesTableLoading />
	)
}

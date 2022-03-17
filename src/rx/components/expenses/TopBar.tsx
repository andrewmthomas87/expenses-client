import { Box, Button, Stack, TextField, useTheme } from '@mui/material'
import { useObservableState } from 'observable-hooks'
import { ChangeEvent } from 'react'
import { EMPTY, Observable } from 'rxjs'
import { AddExpenseModalEvent } from './expenses'

type Props = {
	search$?: Observable<string>

	onSearchChange?(e: ChangeEvent<HTMLInputElement>): void
	onAddExpenseModalEvent?(event: AddExpenseModalEvent): void
}

export default function TopBar({ search$, onSearchChange, onAddExpenseModalEvent }: Props): JSX.Element {
	const theme = useTheme()

	const search = useObservableState(search$ || EMPTY, '')

	const onAddExpense = onAddExpenseModalEvent && (() => onAddExpenseModalEvent({ type: 'open' }))

	return (
		<Stack direction="row" spacing={2} alignItems="center">
			<TextField
				size="small"
				label="Search"
				value={search}
				sx={{ bgcolor: theme.palette.background.paper }}
				onChange={onSearchChange}
			/>
			<Box flexGrow={1} />
			<Button size="small" color="primary" variant="contained" onClick={onAddExpense}>
				Add expense
			</Button>
		</Stack>
	)
}

export function TopBarLoading(): JSX.Element {
	const theme = useTheme()

	return (
		<Stack direction="row" spacing={2} alignItems="center">
			<TextField size="small" label="Search" disabled sx={{ bgcolor: theme.palette.background.paper }} />
			<Box flexGrow={1} />
			<Button size="small" color="primary" variant="contained" disabled>
				Add expense
			</Button>
		</Stack>
	)
}

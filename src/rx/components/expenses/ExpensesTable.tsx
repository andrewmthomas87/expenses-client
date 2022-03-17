import { Chip, Paper, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { Expense } from 'rx/services/api'

type Props = {
	filteredExpenses: Expense[]
}

export default function ExpensesTable({ filteredExpenses }: Props): JSX.Element {
	return (
		<TableContainer component={Paper}>
			<Table size="small">
				<TableHead>
					<TableRow>
						<TableCell>Origin</TableCell>
						<TableCell>Description</TableCell>
						<TableCell align="right">Amount</TableCell>
						<TableCell>Charged</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{filteredExpenses.map(({ id, origin, description, amount, charged }) => (
						<TableRow key={id}>
							<TableCell>{origin}</TableCell>
							<TableCell>{description}</TableCell>
							<TableCell align="right">${amount / 100}</TableCell>
							<TableCell>
								<Chip size="small" label={charged} />
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	)
}

export function ExpensesTableLoading(): JSX.Element {
	return (
		<TableContainer component={Paper}>
			<Table size="small">
				<TableHead>
					<TableRow>
						<TableCell>Origin</TableCell>
						<TableCell>Description</TableCell>
						<TableCell align="right">Amount</TableCell>
						<TableCell>Charged</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{Array(10)
						.fill(0)
						.map((_, i) => (
							<TableRow key={i}>
								<TableCell>
									<Skeleton />
								</TableCell>
								<TableCell>
									<Skeleton />
								</TableCell>
								<TableCell align="right">
									<Skeleton />
								</TableCell>
								<TableCell>
									<Skeleton />
								</TableCell>
							</TableRow>
						))}
				</TableBody>
			</Table>
		</TableContainer>
	)
}

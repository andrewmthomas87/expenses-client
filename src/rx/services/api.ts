import { mapTo, Observable, shareReplay, tap, timer } from 'rxjs'
import { v4 } from 'uuid'

export type Expense = {
	id: string
	createdAt: Date
	origin: string
	description: string
	amount: number
	charged: string
}

export default class API {
	private _expenses: Expense[] = JSON.parse(localStorage.getItem('expenses') || '[]')

	public list(): Observable<Expense[]> {
		console.info('list')

		return timer(2000).pipe(mapTo(this._expenses), shareReplay(1))
	}

	public add(expense: Omit<Expense, 'id' | 'createdAt'>): Observable<Expense> {
		console.info('add', { expense })

		const { origin, description, amount, charged } = expense

		return timer(2000).pipe(
			mapTo<Expense>({
				id: v4(),
				createdAt: new Date(),
				origin,
				description,
				amount,
				charged,
			}),
			tap((expense) => {
				if (expense.description === 'bad') {
					throw new Error('bad description')
				}

				this._expenses = [expense, ...this._expenses]
				localStorage.setItem('expenses', JSON.stringify(this._expenses))
			}),
			shareReplay(1)
		)
	}
}

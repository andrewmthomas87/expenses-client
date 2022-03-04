import { catchError, map, Observable, of, startWith } from 'rxjs'

export type PendingResource<P> = {
	state: 'pending'
	pending: P
}

export type FulfilledResource<T> = {
	state: 'fulfilled'
	data: T
}

export type RejectedResource = {
	state: 'rejected'
	error: any
}

export type Resource<T, P = undefined> = PendingResource<P> | FulfilledResource<T> | RejectedResource

export function resourceFrom<T, P = undefined>(input$: Observable<T>, pending: P): Observable<Resource<T, P>> {
	return input$.pipe(
		map(
			(data): Resource<T, P> => ({
				state: 'fulfilled',
				data,
			})
		),
		catchError(
			(error): Observable<Resource<T, P>> =>
				of({
					state: 'rejected',
					error,
				})
		),
		startWith<Resource<T, P>>({ state: 'pending', pending })
	)
}

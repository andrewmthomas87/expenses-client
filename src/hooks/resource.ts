import { useObservable, useObservableState } from 'observable-hooks'
import { map, Observable } from 'rxjs'
import { Resource } from 'util/resource'

export function useResourceObservableState<T, P, O = P>(
	resource$: Observable<Resource<T>>,
	project: {
		fulfilled(data: T): O
		pending(): P
		rejected?(error: any): O
	}
): O | P {
	const initial = project.pending()
	return useObservableState(
		useObservable(() =>
			resource$.pipe(
				map((resource) => {
					switch (resource.state) {
						case 'pending':
							return initial
						case 'fulfilled':
							return project.fulfilled(resource.data)
						case 'rejected':
							if (project.rejected) {
								return project.rejected(resource.error)
							} else {
								throw resource.error
							}
					}
				})
			)
		),
		initial
	)
}

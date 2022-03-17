import { useObservable, useObservableEagerState, useObservableState } from 'observable-hooks'
import { Observable } from 'rxjs'

export function useObservableAndState<T>(init: () => Observable<T>, initialValue: T | (() => T)): T {
	return useObservableState(useObservable(init), initialValue)
}

export function useObservableAndStateEager<T>(init: () => Observable<T>): T {
	return useObservableEagerState(useObservable(init))
}

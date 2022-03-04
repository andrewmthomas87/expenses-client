import { useObservableCallback, useSubscription } from 'observable-hooks'
import { Observable, scan, startWith } from 'rxjs'

export type ColorMode = 'light' | 'dark'

type UseColorMode = {
	colorMode$: Observable<ColorMode>

	onToggle(): void
}

export function useColorMode(storageKey: string, defaultColorMode: ColorMode = 'light'): UseColorMode {
	const [onToggle, colorMode$] = useObservableCallback<ColorMode, void>((events$) => {
		const initial: ColorMode = localStorage.getItem(storageKey) === 'light' ? 'light' : 'dark' || defaultColorMode

		return events$.pipe(
			scan((colorMode) => (colorMode === 'light' ? 'dark' : 'light'), initial),
			startWith(initial)
		)
	})

	useSubscription(colorMode$, (colorMode) => localStorage.setItem(storageKey, colorMode))

	return {
		colorMode$,
		onToggle,
	}
}

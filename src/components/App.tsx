import { CssBaseline, Theme, ThemeProvider } from '@mui/material'
import { ColorMode, useColorMode } from 'hooks/colorMode'
import { useObservable, useObservableEagerState } from 'observable-hooks'
import { map, Observable } from 'rxjs'
import { themeForColorMode } from 'theme'
import Expenses from './expenses'
import Nav from './Nav'

export default function App(): JSX.Element {
	const { colorMode$, onToggle: onToggleColorMode } = useColorMode(import.meta.env.VITE_COLOR_MODE_STORAGE_KEY)

	const theme = useTheme(colorMode$)

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<Nav colorMode$={colorMode$} onToggleColorMode={onToggleColorMode} />
			<Expenses />
		</ThemeProvider>
	)
}

function useTheme(colorMode$: Observable<ColorMode>): Theme {
	return useObservableEagerState(useObservable(() => colorMode$.pipe(map(themeForColorMode))))
}

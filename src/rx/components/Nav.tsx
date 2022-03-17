import { DarkMode as DarkModeIcon, LightMode as LightModeIcon } from '@mui/icons-material'
import { AppBar, Box, IconButton, Toolbar, Typography } from '@mui/material'
import { useObservable, useObservableEagerState } from 'observable-hooks'
import { map, Observable } from 'rxjs'
import { ColorMode } from 'theme'

type Props = {
	colorMode$: Observable<ColorMode>

	onToggleColorMode(): void
}

export default function Nav({ colorMode$, onToggleColorMode }: Props): JSX.Element {
	const icon = useIcon(colorMode$)

	return (
		<AppBar position="sticky">
			<Toolbar>
				<Typography variant="h6">Expenses</Typography>
				<Box flexGrow={1} />
				<IconButton color="inherit" onClick={onToggleColorMode}>
					{icon}
				</IconButton>
			</Toolbar>
		</AppBar>
	)
}

function useIcon(colorMode$: Observable<ColorMode>): JSX.Element {
	return useObservableEagerState(
		useObservable(() =>
			colorMode$.pipe(map((colorMode) => (colorMode === 'light' ? <LightModeIcon /> : <DarkModeIcon />)))
		)
	)
}

import { colors, createTheme, Theme } from '@mui/material'
import { ColorMode } from './hooks/colorMode'

const lightTheme = createTheme({
	palette: {
		mode: 'light',
		background: {
			default: colors.grey[100],
		},
	},
})

const darkTheme = createTheme({
	palette: {
		mode: 'dark',
	},
})

export function themeForColorMode(colorMode: ColorMode): Theme {
	return colorMode === 'light' ? lightTheme : darkTheme
}

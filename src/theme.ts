import { colors, createTheme, Theme } from '@mui/material'

export type ColorMode = 'light' | 'dark'

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

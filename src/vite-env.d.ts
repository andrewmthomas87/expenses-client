/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_COLOR_MODE_STORAGE_KEY: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}

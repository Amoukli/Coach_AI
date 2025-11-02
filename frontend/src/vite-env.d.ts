/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_WS_URL: string
  readonly VITE_AZURE_AD_CLIENT_ID?: string
  readonly VITE_AZURE_AD_TENANT?: string
  readonly VITE_AZURE_AD_AUTHORITY?: string
  readonly VITE_AZURE_AD_REDIRECT_URI?: string
  readonly VITE_ENV?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

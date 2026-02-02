/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_AI_SERVICE_URL: string
  readonly VITE_DEMO_MODE: string
  readonly VITE_LOG_LEVEL: string
  readonly VITE_DEBUG: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

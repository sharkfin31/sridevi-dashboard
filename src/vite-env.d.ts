/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NOTION_TOKEN: string
  readonly VITE_NOTION_BOOKINGS_DB_ID: string
  readonly VITE_NOTION_MAINTENANCE_DB_ID: string
  readonly VITE_NOTION_BUSES_DB_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_APP_NAME?: string;
  readonly VITE_USE_MOCK_PMS?: string;
  readonly VITE_RECEPTION_PHONE?: string;
  readonly VITE_RECEPTION_WHATSAPP?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}


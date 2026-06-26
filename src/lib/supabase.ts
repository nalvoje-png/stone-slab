import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Indica se as variáveis de ambiente foram configuradas.
// Não lançamos erro aqui para não deixar a tela em branco — quem trata
// a ausência é a <ConfigGate>, que mostra instruções claras.
export const isSupabaseConfigured = Boolean(url && anonKey);

// Se não configurado, usamos valores placeholder só para o createClient não
// quebrar na importação. Nenhuma chamada real será feita nesse estado,
// pois o ConfigGate bloqueia o app antes.
export const supabase = createClient<Database>(
  url || "https://placeholder.supabase.co",
  anonKey || "placeholder-key"
);

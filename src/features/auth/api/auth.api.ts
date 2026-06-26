import { supabase } from "@/lib/supabase";
import type { AccountType } from "@/types/database";

export interface SignupPayload {
  email: string;
  password: string;
  displayName: string;
  username: string;
  accountType: AccountType;
  companyName?: string;
  countryCode?: string;
  city?: string;
}

export async function signIn(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signUp(payload: SignupPayload) {
  const { data, error } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      data: {
        display_name: payload.displayName,
        username: payload.username,
        account_type: payload.accountType,
        company_name: payload.companyName ?? null,
        country_code: payload.countryCode ?? null,
        city: payload.city ?? null,
      },
    },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function isUsernameAvailable(username: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username.toLowerCase())
    .maybeSingle();
  if (error) throw error;
  return !data;
}

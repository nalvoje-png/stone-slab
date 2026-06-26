// Tipos do banco. No futuro, gere automaticamente com:
//   supabase gen types typescript --project-id SEU_ID > src/types/database.ts

export type AccountType =
  | "pedreira"
  | "serraria"
  | "industria"
  | "marmoraria"
  | "arquiteto"
  | "designer"
  | "comprador"
  | "distribuidor";

export interface Profile {
  id: string;
  account_type: AccountType;
  display_name: string;
  username: string;
  avatar_url: string | null;
  logo_url: string | null;
  banner_url: string | null;
  company_name: string | null;
  country_code: string | null;
  city: string | null;
  bio: string | null;
  website: string | null;
  whatsapp: string | null;
  instagram: string | null;
  linkedin: string | null;
  is_verified: boolean;
  followers_count: number;
  following_count: number;
  posts_count: number;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<
          Profile,
          "followers_count" | "following_count" | "posts_count" | "is_verified" | "created_at"
        > &
          Partial<Pick<Profile, "is_verified">>;
        Update: Partial<Profile>;
      };
    };
  };
}

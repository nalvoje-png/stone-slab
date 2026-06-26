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
      posts: {
        Row: Post;
        Insert: Pick<Post, "author_id"> &
          Partial<Pick<Post, "caption" | "availability" | "location">>;
        Update: Partial<Post>;
      };
      post_media: {
        Row: PostMedia;
        Insert: Pick<PostMedia, "post_id" | "storage_path"> &
          Partial<Pick<PostMedia, "width" | "height" | "position">>;
        Update: Partial<PostMedia>;
      };
      stones: {
        Row: Stone;
        Insert: Pick<Stone, "slug" | "name"> & Partial<Pick<Stone, "stone_type">>;
        Update: Partial<Stone>;
      };
      post_stones: {
        Row: { post_id: string; stone_id: string };
        Insert: { post_id: string; stone_id: string };
        Update: Partial<{ post_id: string; stone_id: string }>;
      };
      likes: {
        Row: { user_id: string; post_id: string; created_at: string };
        Insert: { user_id: string; post_id: string };
        Update: never;
      };
      saved_posts: {
        Row: { user_id: string; post_id: string; created_at: string };
        Insert: { user_id: string; post_id: string };
        Update: never;
      };
    };
  };
}

// ===== Feed (v1.1.3) =====
export type Availability = "disponivel" | "reservado" | "vendido" | "nenhuma";

export interface Stone {
  id: string;
  slug: string;
  name: string;
  stone_type: string | null;
  created_at: string;
}

export interface PostMedia {
  id: string;
  post_id: string;
  storage_path: string;
  width: number | null;
  height: number | null;
  position: number;
}

export interface Post {
  id: string;
  author_id: string;
  caption: string | null;
  availability: Availability;
  location: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
}

// Post com dados agregados para exibição no feed
export interface FeedPost extends Post {
  author: Pick<Profile, "id" | "display_name" | "username" | "avatar_url" | "company_name" | "account_type" | "is_verified">;
  media: PostMedia[];
  stones: Stone[];
  liked_by_me: boolean;
  saved_by_me: boolean;
}

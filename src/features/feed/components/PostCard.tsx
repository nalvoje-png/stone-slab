import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Heart, MessageCircle, Bookmark, Share2, BadgeCheck, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/time";
import { Avatar } from "@/components/ui/avatar";
import { AvailabilityBadge } from "@/components/ui/availability-badge";
import { mediaUrl } from "../api/feed.api";
import type { FeedPost } from "@/types/database";

interface PostCardProps {
  post: FeedPost;
  onToggleLike: (post: FeedPost) => void;
  onToggleSave: (post: FeedPost) => void;
}

export function PostCard({ post, onToggleLike, onToggleSave }: PostCardProps) {
  const { i18n } = useTranslation();
  const [imgLoaded, setImgLoaded] = useState(false);
  const photo = post.media[0];

  return (
    <article className="animate-fade-up overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      {/* Cabeçalho */}
      <header className="flex items-center gap-3 px-4 py-3">
        <Avatar src={post.author.avatar_url} name={post.author.display_name} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="truncate text-title text-foreground">
              {post.author.company_name || post.author.display_name}
            </span>
            {post.author.is_verified && (
              <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />
            )}
          </div>
          <div className="flex items-center gap-1.5 text-caption text-muted-foreground">
            <span>@{post.author.username}</span>
            <span>·</span>
            <span>{timeAgo(post.created_at, i18n.resolvedLanguage ?? "pt")}</span>
          </div>
        </div>
        {post.availability !== "nenhuma" && (
          <AvailabilityBadge status={post.availability} />
        )}
      </header>

      {/* Foto — protagonista. Proporção 4:5, cantos retos (já dentro do card). */}
      {photo && (
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-secondary">
          {!imgLoaded && <div className="absolute inset-0 animate-pulse bg-secondary" />}
          <img
            src={mediaUrl(photo.storage_path)}
            alt={post.caption ?? ""}
            onLoad={() => setImgLoaded(true)}
            onDoubleClick={() => !post.liked_by_me && onToggleLike(post)}
            className={cn(
              "h-full w-full object-cover transition-opacity duration-500",
              imgLoaded ? "opacity-100" : "opacity-0"
            )}
            loading="lazy"
          />
        </div>
      )}

      {/* Ações — discretas, não competem com a foto */}
      <div className="flex items-center gap-1 px-2 py-2">
        <button
          onClick={() => onToggleLike(post)}
          className="group flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-secondary"
          aria-label="Curtir"
        >
          <Heart
            className={cn(
              "h-[22px] w-[22px] transition-all group-active:scale-125",
              post.liked_by_me ? "fill-destructive text-destructive" : "text-foreground"
            )}
          />
          {post.likes_count > 0 && (
            <span className="text-caption font-medium text-foreground">{post.likes_count}</span>
          )}
        </button>

        <button
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-foreground transition-colors hover:bg-secondary"
          aria-label="Comentar"
        >
          <MessageCircle className="h-[22px] w-[22px]" />
          {post.comments_count > 0 && (
            <span className="text-caption font-medium">{post.comments_count}</span>
          )}
        </button>

        <button
          className="flex items-center rounded-md px-2.5 py-1.5 text-foreground transition-colors hover:bg-secondary"
          aria-label="Compartilhar"
        >
          <Share2 className="h-[22px] w-[22px]" />
        </button>

        <button
          onClick={() => onToggleSave(post)}
          className="ml-auto flex items-center rounded-md px-2.5 py-1.5 text-foreground transition-colors hover:bg-secondary group"
          aria-label="Salvar"
        >
          <Bookmark
            className={cn(
              "h-[22px] w-[22px] transition-all group-active:scale-110",
              post.saved_by_me ? "fill-foreground text-foreground" : "text-foreground"
            )}
          />
        </button>
      </div>

      {/* Legenda + pedras + local */}
      <div className="px-4 pb-4">
        {post.caption && (
          <p className="text-body text-foreground">
            <span className="font-semibold">@{post.author.username}</span>{" "}
            {post.caption}
          </p>
        )}

        {post.stones.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {post.stones.map((s) => (
              <span key={s.id} className="text-caption font-medium text-primary">
                #{s.name.replace(/\s+/g, "")}
              </span>
            ))}
          </div>
        )}

        {post.location && (
          <div className="mt-2 flex items-center gap-1 text-caption text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {post.location}
          </div>
        )}
      </div>
    </article>
  );
}

export function PostCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="h-11 w-11 animate-pulse rounded-full bg-secondary" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-32 animate-pulse rounded bg-secondary" />
          <div className="h-2.5 w-20 animate-pulse rounded bg-secondary" />
        </div>
      </div>
      <div className="aspect-[4/5] w-full animate-pulse bg-secondary" />
      <div className="space-y-2 p-4">
        <div className="h-3 w-3/4 animate-pulse rounded bg-secondary" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-secondary" />
      </div>
    </div>
  );
}

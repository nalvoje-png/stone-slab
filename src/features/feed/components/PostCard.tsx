import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Heart, MessageCircle, Bookmark, Share2, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/time";
import { flagEmoji, countryName } from "@/lib/country";
import { Avatar } from "@/components/ui/avatar";
import { AvailabilityBadge } from "@/components/ui/availability-badge";
import { mediaUrl } from "../api/feed.api";
import { PhotoViewer } from "./PhotoViewer";
import { CatalogAccessButton } from "@/features/catalog/components/CatalogAccessButton";
import { ShowroomAction } from "@/features/catalog/components/ShowroomAction";
import type { FeedPost } from "@/types/database";

interface PostCardProps {
  post: FeedPost;
  onToggleLike: (post: FeedPost) => void;
  onToggleSave: (post: FeedPost) => void;
}

// Separa a legenda em título (1ª linha) e corpo (resto).
function splitCaption(caption: string | null) {
  if (!caption) return { title: null as string | null, body: null as string | null };
  const [first, ...rest] = caption.split("\n");
  const body = rest.join("\n").trim();
  return { title: first.trim() || null, body: body || null };
}

export function PostCard({ post, onToggleLike, onToggleSave }: PostCardProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? "pt";
  const [imgLoaded, setImgLoaded] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);

  const photo = post.media[0];
  const { title, body } = splitCaption(post.caption);
  const category = t(`accountType.${post.author.account_type}`);
  const flag = flagEmoji(post.author.country_code);
  const country = countryName(post.author.country_code, lang);

  return (
    <article className="animate-fade-up pb-6">
      <header className="flex items-center gap-3 px-4 pb-2.5">
        <Avatar src={post.author.avatar_url} name={post.author.display_name} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="truncate text-[15px] font-semibold text-foreground">
              {post.author.company_name || post.author.display_name}
            </span>
            {post.author.is_verified && (
              <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />
            )}
          </div>
          <div className="text-[12.5px] text-muted-foreground">
            {category}
            {country && (
              <>
                {" \u2022 "}
                {country} {flag}
              </>
            )}
          </div>
        </div>
        {post.availability !== "nenhuma" && <AvailabilityBadge status={post.availability} />}
      </header>

      {photo && (
        <div className="px-3">
          <button
            onClick={() => setViewerOpen(true)}
            className="relative block aspect-[4/5] w-full overflow-hidden rounded-[18px] bg-secondary"
          >
            {!imgLoaded && <div className="absolute inset-0 animate-pulse bg-secondary" />}
            <img
              src={mediaUrl(photo.storage_path)}
              alt={title ?? ""}
              onLoad={() => setImgLoaded(true)}
              onDoubleClick={() => !post.liked_by_me && onToggleLike(post)}
              className={cn(
                "h-full w-full object-cover transition-opacity duration-500",
                imgLoaded ? "opacity-100" : "opacity-0"
              )}
              loading="lazy"
            />
          </button>
        </div>
      )}

      <div className="flex items-center gap-5 px-5 pt-3.5">
        <button onClick={() => onToggleLike(post)} className="group" aria-label="Curtir">
          <Heart
            className={cn(
              "h-[26px] w-[26px] transition-all group-active:scale-125",
              post.liked_by_me ? "fill-destructive text-destructive" : "text-foreground"
            )}
            strokeWidth={1.7}
          />
        </button>
        <button aria-label="Comentar">
          <MessageCircle className="h-[26px] w-[26px] text-foreground" strokeWidth={1.7} />
        </button>
        <button aria-label="Compartilhar">
          <Share2 className="h-[26px] w-[26px] text-foreground" strokeWidth={1.7} />
        </button>
        <div className="ml-auto flex items-center gap-5">
          <ShowroomAction companyId={post.author.id} />
          <button onClick={() => onToggleSave(post)} className="group" aria-label="Salvar">
            <Bookmark
              className={cn(
                "h-[26px] w-[26px] text-foreground transition-all group-active:scale-110",
                post.saved_by_me && "fill-foreground"
              )}
              strokeWidth={1.7}
            />
          </button>
        </div>
      </div>

      {post.likes_count > 0 && (
        <div className="px-5 pt-2.5 text-[14px] font-semibold text-foreground">
          {post.likes_count} {post.likes_count === 1 ? t("feed.like") : t("feed.likes")}
        </div>
      )}

      <div className="px-5 pt-2">
        {title && <h3 className="font-display text-[19px] font-500 text-foreground">{title}</h3>}
        {post.location && (
          <div className="mt-1 text-[13.5px] text-muted-foreground">\ud83d\udccd {post.location}</div>
        )}
        {body && <p className="mt-2 text-[14px] leading-relaxed text-foreground">{body}</p>}
        {post.stones.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {post.stones.map((s) => (
              <span key={s.id} className="text-[13.5px] font-medium text-primary">
                #{s.name.replace(/\s+/g, "")}
              </span>
            ))}
          </div>
        )}
        <div className="mt-2 text-[12px] text-muted-foreground">{timeAgo(post.created_at, lang)}</div>

        {/* Ponte comercial discreta — solicitar acesso ao catálogo da empresa */}
        <div className="mt-3.5">
          <CatalogAccessButton companyId={post.author.id} originPostId={post.id} />
        </div>
      </div>

      {viewerOpen && photo && (
        <PhotoViewer
          src={mediaUrl(photo.storage_path)}
          title={title ?? undefined}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </article>
  );
}

export function PostCardSkeleton() {
  return (
    <div className="pb-6">
      <div className="flex items-center gap-3 px-4 pb-2.5">
        <div className="h-11 w-11 animate-pulse rounded-full bg-secondary" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-32 animate-pulse rounded bg-secondary" />
          <div className="h-2.5 w-24 animate-pulse rounded bg-secondary" />
        </div>
      </div>
      <div className="px-3">
        <div className="aspect-[4/5] w-full animate-pulse rounded-[18px] bg-secondary" />
      </div>
    </div>
  );
}

import { useState, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Loader2 } from "lucide-react";
import { Dialog, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Chip } from "@/components/ui/chip";
import { listStones, createPost } from "../api/feed.api";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { Availability } from "@/types/database";

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
}

const AVAILABILITIES: Availability[] = ["nenhuma", "disponivel", "reservado", "vendido"];

export function CreatePostModal({ open, onClose }: CreatePostModalProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [availability, setAvailability] = useState<Availability>("nenhuma");
  const [stoneIds, setStoneIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { data: stones = [] } = useQuery({ queryKey: ["stones"], queryFn: listStones });

  const canPublish = useMemo(() => Boolean(file), [file]);

  function reset() {
    setFile(null); setPreview(null); setCaption(""); setLocation("");
    setAvailability("nenhuma"); setStoneIds([]); setError(null);
  }

  function handleClose() {
    if (mutation.isPending) return;
    reset();
    onClose();
  }

  function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError(null);
  }

  function toggleStone(id: string) {
    setStoneIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }

  const mutation = useMutation({
    mutationFn: () =>
      createPost({
        authorId: user!.id,
        caption, location, availability,
        stoneIds, file: file!,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feed"] });
      reset();
      onClose();
    },
    onError: () => setError(t("errors.generic")),
  });

  function handlePublish() {
    if (!file) { setError(t("create.needPhoto")); return; }
    mutation.mutate();
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogHeader title={t("create.title")} onClose={handleClose} />

      <div className="space-y-5 p-4">
        {/* Upload de foto */}
        <div>
          <Label>{t("create.photo")}</Label>
          <input ref={fileRef} type="file" accept="image/*" onChange={pickFile} className="hidden" />
          {preview ? (
            <div className="mt-2 overflow-hidden rounded-xl border border-border">
              <div className="aspect-[4/5] w-full bg-secondary">
                <img src={preview} alt="" className="h-full w-full object-cover" />
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full bg-secondary py-2.5 text-caption font-medium text-foreground transition-colors hover:bg-secondary/70"
              >
                {t("create.changePhoto")}
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="mt-2 flex aspect-[4/5] w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-surface text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary-soft/40"
            >
              <ImagePlus className="h-9 w-9" />
              <span className="text-body font-medium">{t("create.choosePhoto")}</span>
            </button>
          )}
        </div>

        {/* Legenda */}
        <div>
          <Label htmlFor="caption">{t("create.caption")}</Label>
          <Textarea
            id="caption"
            className="mt-1.5"
            placeholder={t("create.captionPh")}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={2200}
          />
        </div>

        {/* Tipo de pedra */}
        <div>
          <Label>{t("create.stones")}</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {stones.map((s) => (
              <Chip key={s.id} active={stoneIds.includes(s.id)} onClick={() => toggleStone(s.id)}>
                {s.name}
              </Chip>
            ))}
          </div>
        </div>

        {/* Disponibilidade */}
        <div>
          <Label>{t("create.availability")}</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {AVAILABILITIES.map((a) => (
              <Chip key={a} active={availability === a} onClick={() => setAvailability(a)}>
                {t(`availabilityOpt.${a}`)}
              </Chip>
            ))}
          </div>
        </div>

        {/* Localização */}
        <div>
          <Label htmlFor="loc">{t("create.location")}</Label>
          <Input
            id="loc"
            className="mt-1.5"
            placeholder={t("create.locationPh")}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        {error && <p className="text-body text-destructive">{error}</p>}
      </div>

      {/* Rodapé fixo */}
      <div className="sticky bottom-0 border-t border-border bg-card/95 p-4 backdrop-blur">
        <Button
          className="w-full"
          size="lg"
          disabled={!canPublish || mutation.isPending}
          onClick={handlePublish}
        >
          {mutation.isPending ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> {t("create.publishing")}</>
          ) : (
            t("create.publish")
          )}
        </Button>
      </div>
    </Dialog>
  );
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  listMaterials, createMaterial, deleteMaterial,
  listBundles, createBundle, deleteBundle,
  listSlabs, createSlab, deleteSlab,
  type NewBundleInput, type NewSlabInput,
} from "../api/stock.api";

export function useMaterials() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["materials", user?.id],
    enabled: Boolean(user?.id),
    queryFn: () => listMaterials(user!.id),
  });
}

export function useCreateMaterial() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, coverPath, description }: { name: string; coverPath?: string; description?: string }) =>
      createMaterial(user!.id, name, coverPath, description),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["materials", user?.id] }),
  });
}

export function useDeleteMaterial() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMaterial(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["materials", user?.id] }),
  });
}

export function useBundles(materialId: string | undefined) {
  return useQuery({
    queryKey: ["bundles", materialId],
    enabled: Boolean(materialId),
    queryFn: () => listBundles(materialId!),
  });
}

export function useCreateBundle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: NewBundleInput) => createBundle(input),
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ["bundles", v.material_id] }),
  });
}

export function useDeleteBundle(materialId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBundle(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bundles", materialId] }),
  });
}

export function useSlabs(bundleId: string | undefined) {
  return useQuery({
    queryKey: ["slabs", bundleId],
    enabled: Boolean(bundleId),
    queryFn: () => listSlabs(bundleId!),
  });
}

export function useCreateSlab() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: NewSlabInput) => createSlab(input),
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ["slabs", v.bundle_id] }),
  });
}

export function useDeleteSlab(bundleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSlab(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["slabs", bundleId] }),
  });
}

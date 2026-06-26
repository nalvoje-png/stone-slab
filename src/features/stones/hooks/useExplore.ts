import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchExplore, fetchStonePosts, EXPLORE_PAGE } from "../api/stones.api";

export function useExplore() {
  return useInfiniteQuery({
    queryKey: ["explore"],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => fetchExplore(pageParam),
    getNextPageParam: (last, all) => (last.length === EXPLORE_PAGE ? all.length : undefined),
  });
}

export function useStonePosts(stoneId: string | undefined) {
  return useInfiniteQuery({
    queryKey: ["stone-posts", stoneId],
    enabled: Boolean(stoneId),
    initialPageParam: 0,
    queryFn: ({ pageParam }) => fetchStonePosts(stoneId!, pageParam),
    getNextPageParam: (last, all) => (last.length === EXPLORE_PAGE ? all.length : undefined),
  });
}

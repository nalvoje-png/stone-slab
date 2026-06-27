import { createBrowserRouter, Navigate } from "react-router-dom";
import { LoginPage } from "@/features/auth/components/LoginPage";
import { SignupPage } from "@/features/auth/components/SignupPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import { FeedPage } from "@/features/feed/components/FeedPage";
import { ExplorePage } from "@/features/stones/components/ExplorePage";
import { StonesIndexPage } from "@/features/stones/components/StonesIndexPage";
import { StonePage } from "@/features/stones/components/StonePage";
import { IncomingRequestsPage } from "@/features/catalog/components/IncomingRequestsPage";
import { MyAccessPage } from "@/features/catalog/components/MyAccessPage";
import { CatalogPortalPage } from "@/features/catalog/components/CatalogPortalPage";
import { StockMaterialsPage } from "@/features/showroom/components/StockMaterialsPage";
import { StockMaterialPage } from "@/features/showroom/components/StockMaterialPage";
import { StockBundlePage } from "@/features/showroom/components/StockBundlePage";
import { ShowroomMaterialPage } from "@/features/showroom/components/ShowroomMaterialPage";
import { ShowroomBundlePage } from "@/features/showroom/components/ShowroomBundlePage";

function Protected({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  );
}

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignupPage /> },
  { path: "/", element: <Protected><FeedPage /></Protected> },
  { path: "/explore", element: <Protected><ExplorePage /></Protected> },
  { path: "/stones", element: <Protected><StonesIndexPage /></Protected> },
  { path: "/stones/:slug", element: <Protected><StonePage /></Protected> },
  { path: "/requests", element: <Protected><IncomingRequestsPage /></Protected> },
  { path: "/my-access", element: <Protected><MyAccessPage /></Protected> },
  { path: "/catalog/:companyId", element: <Protected><CatalogPortalPage /></Protected> },
  { path: "/stock", element: <Protected><StockMaterialsPage /></Protected> },
  { path: "/stock/material/:materialId", element: <Protected><StockMaterialPage /></Protected> },
  { path: "/stock/bundle/:bundleId", element: <Protected><StockBundlePage /></Protected> },
  { path: "/showroom/:companyId/material/:materialId", element: <Protected><ShowroomMaterialPage /></Protected> },
  { path: "/showroom/:companyId/bundle/:bundleId", element: <Protected><ShowroomBundlePage /></Protected> },
  { path: "*", element: <Navigate to="/" replace /> },
]);

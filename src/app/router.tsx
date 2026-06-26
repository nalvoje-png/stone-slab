import { createBrowserRouter, Navigate } from "react-router-dom";
import { LoginPage } from "@/features/auth/components/LoginPage";
import { SignupPage } from "@/features/auth/components/SignupPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import { FeedPage } from "@/features/feed/components/FeedPage";
import { ExplorePage } from "@/features/stones/components/ExplorePage";
import { StonesIndexPage } from "@/features/stones/components/StonesIndexPage";
import { StonePage } from "@/features/stones/components/StonePage";

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
  { path: "*", element: <Navigate to="/" replace /> },
]);

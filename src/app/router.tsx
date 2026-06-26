import { createBrowserRouter, Navigate } from "react-router-dom";
import { LoginPage } from "@/features/auth/components/LoginPage";
import { SignupPage } from "@/features/auth/components/SignupPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import { FeedPage } from "@/features/feed/components/FeedPage";

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
  // rotas futuras (explore, stones, notifications, profile) nas próximas etapas
  { path: "*", element: <Navigate to="/" replace /> },
]);

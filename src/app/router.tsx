import { createBrowserRouter, Navigate } from "react-router-dom";
import { LoginPage } from "@/features/auth/components/LoginPage";
import { SignupPage } from "@/features/auth/components/SignupPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import { FeedPlaceholder } from "@/features/feed/FeedPlaceholder";

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
  { path: "/", element: <Protected><FeedPlaceholder /></Protected> },
  // rotas futuras (explore, create, stones, notifications, profile) chegam nas próximas etapas
  { path: "*", element: <Navigate to="/" replace /> },
]);

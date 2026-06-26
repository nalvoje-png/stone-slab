import { RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/features/auth/hooks/useAuth";
import { queryClient } from "@/lib/queryClient";
import { router } from "./router";
import { ConfigGate } from "./ConfigGate";
import { ErrorBoundary } from "./ErrorBoundary";

export function App() {
  return (
    <ErrorBoundary>
      <ConfigGate>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </QueryClientProvider>
      </ConfigGate>
    </ErrorBoundary>
  );
}

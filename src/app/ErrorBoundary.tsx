import { Component, type ReactNode } from "react";

interface State { hasError: boolean; message: string; }

// Captura qualquer erro de renderização e mostra na tela,
// em vez de deixar o app em branco.
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "Inter, sans-serif" }}>
          <div style={{ maxWidth: 460, textAlign: "center" }}>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: "#0a1a33" }}>Algo deu errado</h1>
            <p style={{ marginTop: 8, fontSize: 14, color: "#8a8782" }}>{this.state.message}</p>
            <button
              onClick={() => location.reload()}
              style={{ marginTop: 20, height: 44, padding: "0 20px", borderRadius: 12, border: "none", background: "#0864EB", color: "#fff", fontSize: 14, fontWeight: 500, cursor: "pointer" }}
            >
              Recarregar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

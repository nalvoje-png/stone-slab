/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1rem", screens: { "2xl": "1280px" } },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        surface: "hsl(var(--surface))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          soft: "hsl(var(--primary-soft))",
        },
        brand: {
          from: "hsl(var(--brand-from))",
          to: "hsl(var(--brand-to))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          soft: "hsl(var(--success-soft))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          soft: "hsl(var(--warning-soft))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          soft: "hsl(var(--destructive-soft))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Fraunces", "Georgia", "serif"],
      },
      // Escala tipográfica fixa — nunca usar tamanhos fora desta
      fontSize: {
        caption: ["0.8125rem", { lineHeight: "1.15rem" }],   // 13
        body: ["0.9375rem", { lineHeight: "1.5rem" }],        // 15
        title: ["0.9375rem", { lineHeight: "1.35rem", fontWeight: "600" }], // 15/600
        h3: ["1.125rem", { lineHeight: "1.6rem", fontWeight: "600" }],       // 18
        h2: ["1.5rem", { lineHeight: "1.9rem", letterSpacing: "-0.01em" }],  // 24
        h1: ["1.875rem", { lineHeight: "2.2rem", letterSpacing: "-0.02em" }],// 30
        display: ["2.5rem", { lineHeight: "2.7rem", letterSpacing: "-0.02em" }], // 40
      },
      // Espaçamento base-4 (os valores nativos do Tailwind já seguem isto;
      // adiciono apenas apelidos semânticos usados no Design System)
      spacing: {
        xs: "0.25rem", sm: "0.5rem", md: "0.75rem",
        base: "1rem", lg: "1.5rem", xl: "2rem",
        "2xl": "3rem", "3xl": "4rem",
      },
      borderRadius: {
        sm: "0.5rem",   // 8
        md: "0.75rem",  // 12
        lg: "1rem",     // 16
        xl: "1.5rem",   // 24
      },
      boxShadow: {
        sm: "0 1px 2px rgba(20,23,31,0.06)",
        md: "0 4px 12px rgba(20,23,31,0.08)",
        lg: "0 12px 32px rgba(20,23,31,0.12)",
        xl: "0 24px 60px rgba(20,23,31,0.16)",
      },
      backgroundImage: {
        brand: "linear-gradient(150deg, hsl(var(--brand-from)), hsl(var(--brand-to)))",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s cubic-bezier(0.16,1,0.3,1)",
        "fade-in": "fade-in 0.25s ease-out",
        "scale-in": "scale-in 0.2s cubic-bezier(0.16,1,0.3,1)",
        "slide-up": "slide-up 0.3s cubic-bezier(0.16,1,0.3,1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

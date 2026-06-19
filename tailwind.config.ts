import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#11B5A4", shadow: "#0d8d80", soft: "#E2F5F0" },
        ink: { DEFAULT: "#143230", shadow: "#061a18" },
        muted: { DEFAULT: "#5E807C", 2: "#4E6F6B" },
        blue: { DEFAULT: "#3D9BFF", dark: "#2D7BD4" },
        green: { DEFAULT: "#36C77C", dark: "#0E8E48" },
        coral: { DEFAULT: "#FF8A5B" },
        gold: { DEFAULT: "#FFC93C", text: "#E8870E" },
        purple: { DEFAULT: "#9B7BFF" },
        red: { DEFAULT: "#FF6363", text: "#D6502F" },
        page: { DEFAULT: "#F3FAF8", canvas: "#E7F3EF" },
        card: "#FFFFFF",
        border: { DEFAULT: "#E6F2EE", soft: "#EAF4F1", strong: "#DDEDE9" },
        scoretrack: "#E3F1EC",
        wordok: { bg: "#E2F6EC", text: "#0E8E48" },
        wordmiss: { bg: "#FDE6E0", text: "#D6502F", border: "#F0A593" },
      },
      fontFamily: {
        display: ["var(--font-baloo)", "sans-serif"],
        body: ["var(--font-nunito)", "sans-serif"],
        comic: ["var(--font-bangers)", "cursive"],
        mono: ["ui-monospace", "monospace"],
      },
      borderRadius: {
        btn: "14px",
        card: "20px",
        panel: "16px",
        chip: "9px",
        pill: "999px",
      },
      boxShadow: {
        card: "0 8px 22px rgba(16,80,74,.05)",
        raised: "0 14px 32px rgba(16,70,66,.12)",
        frame: "0 22px 44px rgba(16,70,66,.17)",
        "btn-primary": "0 5px 0 #0d8d80",
        "btn-ink": "0 5px 0 #061a18",
        "btn-primary-active": "0 1px 0 #0d8d80",
        "btn-ink-active": "0 1px 0 #061a18",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        pulseRing: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(255,99,99,.45)" },
          "50%": { boxShadow: "0 0 0 14px rgba(255,99,99,0)" },
        },
        pop: {
          "0%": { transform: "scale(.7)", opacity: "0" },
          "60%": { transform: "scale(1.06)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        shimmer: "shimmer 1.4s linear infinite",
        pulseRing: "pulseRing 1.4s ease-out infinite",
        pop: "pop .25s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;

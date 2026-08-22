import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Background layers (darkest → lightest) ──
        "vc-bg": "#0a0e1a",
        "vc-bg-subtle": "#0f1424",
        "vc-surface": "rgba(15, 20, 40, 0.6)",
        "vc-surface-elevated": "rgba(20, 28, 55, 0.55)",
        "vc-surface-glass": "rgba(255, 255, 255, 0.04)",

        // ── Text hierarchy ──
        "vc-text": "#e8ecf4",
        "vc-text-secondary": "#8b95b0",
        "vc-text-muted": "#505a74",

        // ── Accent palette ──
        "vc-cyan": "#06b6d4",
        "vc-cyan-muted": "rgba(6, 182, 212, 0.15)",
        "vc-violet": "#8b5cf6",
        "vc-violet-muted": "rgba(139, 92, 246, 0.15)",
        "vc-emerald": "#10b981",
        "vc-emerald-muted": "rgba(16, 185, 129, 0.15)",

        // ── Semantic ──
        "vc-success": "#10b981",
        "vc-warning": "#f59e0b",
        "vc-error": "#ef4444",
        "vc-info": "#06b6d4",

        // ── Borders ──
        "vc-border": "rgba(255, 255, 255, 0.08)",
        "vc-border-subtle": "rgba(255, 255, 255, 0.04)",
        "vc-border-accent": "rgba(6, 182, 212, 0.25)",

        // ── Legacy compatibility (kept for any references in lib/) ──
        "primary": "#10b981",
        "primary-container": "#10b981",
        "on-primary": "#ffffff",
        "on-primary-container": "#00422b",
        "secondary": "#06b6d4",
        "surface": "#0a0e1a",
        "on-surface": "#e8ecf4",
        "on-surface-variant": "#8b95b0",
        "surface-container-low": "#0f1424",
        "surface-container": "#141c37",
        "error": "#ef4444",
        "error-container": "#7f1d1d",
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },

      fontSize: {
        'display': ['2.5rem', { lineHeight: '1.1', fontWeight: '800', letterSpacing: '-0.025em' }],
        'heading': ['1.75rem', { lineHeight: '1.2', fontWeight: '700', letterSpacing: '-0.02em' }],
        'title': ['1.25rem', { lineHeight: '1.3', fontWeight: '600', letterSpacing: '-0.01em' }],
        'body-lg': ['1rem', { lineHeight: '1.5', fontWeight: '400' }],
        'body': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['0.75rem', { lineHeight: '1.4', fontWeight: '500' }],
        'micro': ['0.6875rem', { lineHeight: '1.3', fontWeight: '600' }],
      },
      borderRadius: {
        'glass': '1rem',
        'pill': '9999px',
      },
      boxShadow: {
        'glass': '0 4px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'glass-sm': '0 2px 12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
        'glass-lg': '0 8px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
        'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.25), 0 0 60px rgba(6, 182, 212, 0.08)',
        'glow-emerald': '0 0 20px rgba(16, 185, 129, 0.25), 0 0 60px rgba(16, 185, 129, 0.08)',
        'glow-violet': '0 0 20px rgba(139, 92, 246, 0.25), 0 0 60px rgba(139, 92, 246, 0.08)',
        'glow-error': '0 0 20px rgba(239, 68, 68, 0.25), 0 0 60px rgba(239, 68, 68, 0.08)',
        'glow-warning': '0 0 20px rgba(245, 158, 11, 0.25), 0 0 60px rgba(245, 158, 11, 0.08)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.06), inset 0 -1px 0 rgba(0, 0, 0, 0.1)',
      },
      backdropBlur: {
        'glass': '16px',
        'glass-heavy': '24px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in-down': 'fadeInDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-down': 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-soft': 'pulseSoft 2.5s ease-in-out infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 12px rgba(6, 182, 212, 0.2)' },
          '50%': { boxShadow: '0 0 24px rgba(6, 182, 212, 0.35)' },
        },
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
export default config;

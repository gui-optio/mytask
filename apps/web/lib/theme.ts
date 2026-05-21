export const colors = {
  bg: "#FAFAF7",
  bgCard: "#FFFFFF",
  bgMuted: "#F4F4F0",
  fg: "#0A0A0A",
  fgMuted: "#6B7280",
  fgSubtle: "#9CA3AF",
  border: "#E7E5E0",
  borderStrong: "#D4D4D4",
  accent: "#10B981",
  accentHover: "#059669",
  accentBg: "#ECFDF5",
  danger: "#DC2626",
  dangerBg: "#FEF2F2",
  warning: "#F59E0B",
  warningBg: "#FEF3C7",
  info: "#3B82F6",
  infoBg: "#EFF6FF",
} as const;

export const radius = {
  sm: "6px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  full: "999px",
} as const;

export const shadow = {
  sm: "0 1px 2px rgba(0,0,0,0.04)",
  md: "0 4px 12px rgba(0,0,0,0.06)",
  lg: "0 12px 32px rgba(0,0,0,0.08)",
} as const;

export const space = {
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
  16: "4rem",
  20: "5rem",
  24: "6rem",
} as const;

export const font = {
  size: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "2rem",
    "4xl": "2.5rem",
    "5xl": "3.5rem",
    "6xl": "4.5rem",
  },
  weight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;

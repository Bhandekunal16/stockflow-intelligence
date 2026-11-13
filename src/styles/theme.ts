/**
 * Centralized Theme 3 – Graphite token references for SVG/Chart libraries (Recharts).
 * Mirrors the CSS custom properties defined in src/index.css.
 */
export const GRAPHITE_THEME = {
  bgCanvas: '#18181B',
  bgSidebar: '#09090B',
  bgCard: '#27272A',
  bgElevated: '#3F3F46',
  accentPrimary: '#A78BFA',
  accentSecondary: '#8B5CF6',
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#60A5FA',
  textPrimary: '#FAFAFA',
  textSecondary: '#A1A1AA',
  border: '#3F3F46',
  referenceMuted: '#71717A',
} as const;

export const GRAPHITE_CHART_PALETTE = [
  '#A78BFA', // Primary Line (Violet)
  '#60A5FA', // Secondary Line (Blue)
  '#34D399', // Success Metrics (Emerald)
  '#FBBF24', // Warning Metrics (Amber)
  '#F87171', // Error Metrics (Coral)
  '#8B5CF6', // Secondary Violet
  '#38BDF8', // Sky
  '#C084FC', // Orchid
  '#A1A1AA', // Zinc
  '#52525B', // Graphite
];

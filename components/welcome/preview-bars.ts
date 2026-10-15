// Exact 56 waveform bars from reference 02-man-hinh-chao.html
export interface PreviewBar {
  height: number;
  bg: string;
  opacity: number;
  delay: string;
}

export const PREVIEW_BARS: PreviewBar[] = [
  // 0..13: Played outside A-B (opacity 0.45, color #1d1d1f)
  { height: 15, bg: "#1d1d1f", opacity: 0.45, delay: "0.00s" },
  { height: 21, bg: "#1d1d1f", opacity: 0.45, delay: "0.09s" },
  { height: 25, bg: "#1d1d1f", opacity: 0.45, delay: "0.18s" },
  { height: 22, bg: "#1d1d1f", opacity: 0.45, delay: "0.27s" },
  { height: 21, bg: "#1d1d1f", opacity: 0.45, delay: "0.36s" },
  { height: 27, bg: "#1d1d1f", opacity: 0.45, delay: "0.45s" },
  { height: 25, bg: "#1d1d1f", opacity: 0.45, delay: "0.54s" },
  { height: 27, bg: "#1d1d1f", opacity: 0.45, delay: "0.63s" },
  { height: 36, bg: "#1d1d1f", opacity: 0.45, delay: "0.72s" },
  { height: 31, bg: "#1d1d1f", opacity: 0.45, delay: "0.81s" },
  { height: 36, bg: "#1d1d1f", opacity: 0.45, delay: "0.90s" },
  { height: 58, bg: "#1d1d1f", opacity: 0.45, delay: "0.99s" },
  { height: 68, bg: "#1d1d1f", opacity: 0.45, delay: "1.08s" },
  { height: 57, bg: "#1d1d1f", opacity: 0.45, delay: "1.17s" },
  // 14..24: Played inside A-B (opacity 1, color #1d1d1f)
  { height: 32, bg: "#1d1d1f", opacity: 1, delay: "1.26s" },
  { height: 44, bg: "#1d1d1f", opacity: 1, delay: "1.35s" },
  { height: 45, bg: "#1d1d1f", opacity: 1, delay: "1.44s" },
  { height: 33, bg: "#1d1d1f", opacity: 1, delay: "1.53s" },
  { height: 54, bg: "#1d1d1f", opacity: 1, delay: "1.62s" },
  { height: 55, bg: "#1d1d1f", opacity: 1, delay: "1.71s" },
  { height: 32, bg: "#1d1d1f", opacity: 1, delay: "1.80s" },
  { height: 68, bg: "#1d1d1f", opacity: 1, delay: "1.89s" },
  { height: 92, bg: "#1d1d1f", opacity: 1, delay: "1.98s" },
  { height: 87, bg: "#1d1d1f", opacity: 1, delay: "2.07s" },
  { height: 57, bg: "#1d1d1f", opacity: 1, delay: "2.16s" },
  // 25..35: Unplayed inside A-B (opacity 1, color #c7c7cc)
  { height: 42, bg: "#c7c7cc", opacity: 1, delay: "2.25s" },
  { height: 55, bg: "#c7c7cc", opacity: 1, delay: "2.34s" },
  { height: 40, bg: "#c7c7cc", opacity: 1, delay: "0.03s" },
  { height: 54, bg: "#c7c7cc", opacity: 1, delay: "0.12s" },
  { height: 66, bg: "#c7c7cc", opacity: 1, delay: "0.21s" },
  { height: 51, bg: "#c7c7cc", opacity: 1, delay: "0.30s" },
  { height: 52, bg: "#c7c7cc", opacity: 1, delay: "0.39s" },
  { height: 85, bg: "#c7c7cc", opacity: 1, delay: "0.48s" },
  { height: 92, bg: "#c7c7cc", opacity: 1, delay: "0.57s" },
  { height: 71, bg: "#c7c7cc", opacity: 1, delay: "0.66s" },
  { height: 37, bg: "#c7c7cc", opacity: 1, delay: "0.75s" },
  // 36..55: Unplayed outside A-B (opacity 0.45, color #c7c7cc)
  { height: 47, bg: "#c7c7cc", opacity: 0.45, delay: "0.84s" },
  { height: 43, bg: "#c7c7cc", opacity: 0.45, delay: "0.93s" },
  { height: 39, bg: "#c7c7cc", opacity: 0.45, delay: "1.02s" },
  { height: 56, bg: "#c7c7cc", opacity: 0.45, delay: "1.11s" },
  { height: 53, bg: "#c7c7cc", opacity: 0.45, delay: "1.20s" },
  { height: 29, bg: "#c7c7cc", opacity: 0.45, delay: "1.29s" },
  { height: 53, bg: "#c7c7cc", opacity: 0.45, delay: "1.38s" },
  { height: 66, bg: "#c7c7cc", opacity: 0.45, delay: "1.47s" },
  { height: 59, bg: "#c7c7cc", opacity: 0.45, delay: "1.56s" },
  { height: 38, bg: "#c7c7cc", opacity: 0.45, delay: "1.65s" },
  { height: 27, bg: "#c7c7cc", opacity: 0.45, delay: "1.74s" },
  { height: 30, bg: "#c7c7cc", opacity: 0.45, delay: "1.83s" },
  { height: 21, bg: "#c7c7cc", opacity: 0.45, delay: "1.92s" },
  { height: 30, bg: "#c7c7cc", opacity: 0.45, delay: "2.01s" },
  { height: 31, bg: "#c7c7cc", opacity: 0.45, delay: "2.10s" },
  { height: 24, bg: "#c7c7cc", opacity: 0.45, delay: "2.19s" },
  { height: 20, bg: "#c7c7cc", opacity: 0.45, delay: "2.28s" },
  { height: 24, bg: "#c7c7cc", opacity: 0.45, delay: "2.37s" },
  { height: 21, bg: "#c7c7cc", opacity: 0.45, delay: "0.06s" },
  { height: 15, bg: "#c7c7cc", opacity: 0.45, delay: "0.15s" },
];

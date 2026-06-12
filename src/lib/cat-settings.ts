export type CatSettings = {
  catSize: number;
  followDistance: number;
  smoothing: number;
};

export const DEFAULT_CAT_SETTINGS: CatSettings = {
  catSize: 50,
  followDistance: 50,
  smoothing: 0.16,
};

export const CAT_SETTINGS_KEY = "chonk-cat-settings";

export function loadCatSettings(): CatSettings {
  if (typeof window === "undefined") {
    return DEFAULT_CAT_SETTINGS;
  }

  try {
    const raw = window.localStorage.getItem(CAT_SETTINGS_KEY);
    if (!raw) {
      return DEFAULT_CAT_SETTINGS;
    }

    const parsed = JSON.parse(raw) as Partial<CatSettings>;
    const catSize = Number(parsed.catSize);
    const followDistance = Number(parsed.followDistance);
    const smoothing = Number(parsed.smoothing);

    return {
      catSize: Number.isFinite(catSize) ? catSize : DEFAULT_CAT_SETTINGS.catSize,
      followDistance: Number.isFinite(followDistance)
        ? followDistance
        : DEFAULT_CAT_SETTINGS.followDistance,
      smoothing: Number.isFinite(smoothing) ? smoothing : DEFAULT_CAT_SETTINGS.smoothing,
    };
  } catch {
    return DEFAULT_CAT_SETTINGS;
  }
}

export function saveCatSettings(settings: CatSettings) {
  window.localStorage.setItem(CAT_SETTINGS_KEY, JSON.stringify(settings));
}

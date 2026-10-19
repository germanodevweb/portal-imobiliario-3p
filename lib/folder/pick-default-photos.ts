import {
  environmentContains,
  normalizeEnvironmentText,
} from "@/lib/folder/normalize-environment";

export type PickPhotoCandidate = {
  url: string;
  environment: string | null;
  isPrimary: boolean;
  isHidden: boolean;
  sortOrder: number;
};

const EXCLUDED_ENV_TOKENS = [
  "planta",
  "mapa",
  "localiz",
  "master plan",
  "projeto",
] as const;

const PHOTO2_PRIORITY: readonly string[][] = [
  ["sala"],
  ["estar"],
  ["jantar"],
  ["living"],
  ["varanda"],
  ["apartamento"],
  ["ambiente interno"],
];

const PHOTO3_INTERIOR: readonly string[][] = [
  ["suite", "suíte"],
  ["quarto"],
  ["cozinha"],
  ["corredor"],
];

const PHOTO3_LEISURE: readonly string[][] = [
  ["piscina"],
  ["academia"],
  ["fitness"],
  ["rooftop"],
  ["area de lazer", "área de lazer"],
  ["salao de festa", "salão de festa"],
  ["deck"],
];

function isExcluded(normalizedEnv: string): boolean {
  return EXCLUDED_ENV_TOKENS.some((t) => normalizedEnv.includes(t));
}

function isEligible(row: PickPhotoCandidate): boolean {
  if (row.isHidden || !row.url.trim()) return false;
  const env = normalizeEnvironmentText(row.environment ?? "");
  if (env && isExcluded(env)) return false;
  return true;
}

function findByPriority(
  rows: PickPhotoCandidate[],
  used: Set<string>,
  groups: readonly string[][]
): PickPhotoCandidate | null {
  for (const group of groups) {
    for (const token of group) {
      const found = rows.find((row) => {
        if (used.has(row.url) || !isEligible(row)) return false;
        const env = normalizeEnvironmentText(row.environment ?? "");
        return environmentContains(env, token);
      });
      if (found) return found;
    }
  }
  return null;
}

function findLeisureNotPhoto1(
  rows: PickPhotoCandidate[],
  used: Set<string>,
  photo1EnvNorm: string
): PickPhotoCandidate | null {
  for (const group of PHOTO3_LEISURE) {
    for (const token of group) {
      const found = rows.find((row) => {
        if (used.has(row.url) || !isEligible(row)) return false;
        const env = normalizeEnvironmentText(row.environment ?? "");
        if (!environmentContains(env, token)) return false;
        if (photo1EnvNorm && env === photo1EnvNorm) return false;
        return true;
      });
      if (found) return found;
    }
  }
  return null;
}

function pickPhoto1(rows: PickPhotoCandidate[]): PickPhotoCandidate | null {
  const sorted = [...rows].sort((a, b) => a.sortOrder - b.sortOrder);
  const primary = sorted.find((r) => r.isPrimary && isEligible(r));
  if (primary) return primary;
  const first = sorted.find((r) => isEligible(r));
  return first ?? null;
}

function nextFallback(
  rows: PickPhotoCandidate[],
  used: Set<string>
): PickPhotoCandidate | null {
  const sorted = [...rows].sort((a, b) => a.sortOrder - b.sortOrder);
  return sorted.find((r) => isEligible(r) && !used.has(r.url)) ?? null;
}

export function pickDefaultFolderPhotos(
  rows: PickPhotoCandidate[],
  featuredImageUrl: string | null
): [string, string, string] {
  let candidates = rows.filter((r) => r.url.trim());
  if (candidates.length === 0 && featuredImageUrl?.trim()) {
    candidates = [
      {
        url: featuredImageUrl.trim(),
        environment: null,
        isPrimary: true,
        isHidden: false,
        sortOrder: 0,
      },
    ];
  }

  const used = new Set<string>();
  const urls: string[] = [];

  const p1 = pickPhoto1(candidates);
  if (p1) {
    urls.push(p1.url);
    used.add(p1.url);
  }

  let p2 =
    findByPriority(candidates, used, PHOTO2_PRIORITY) ??
    nextFallback(candidates, used);
  if (p2) {
    urls.push(p2.url);
    used.add(p2.url);
  }

  const photo1Env = p1
    ? normalizeEnvironmentText(p1.environment ?? "")
    : "";

  let p3 =
    findByPriority(candidates, used, PHOTO3_INTERIOR) ??
    findLeisureNotPhoto1(candidates, used, photo1Env) ??
    nextFallback(candidates, used);
  if (p3) {
    urls.push(p3.url);
    used.add(p3.url);
  }

  while (urls.length < 3) {
    const fb = nextFallback(candidates, used);
    if (!fb) break;
    urls.push(fb.url);
    used.add(fb.url);
  }

  while (urls.length < 3) {
    urls.push(urls[0] ?? "");
  }

  return [urls[0] ?? "", urls[1] ?? "", urls[2] ?? ""];
}

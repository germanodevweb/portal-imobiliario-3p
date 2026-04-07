/**
 * Transforma a descrição livre do imóvel em blocos estruturados para UI/SEO.
 * Sem alterar dados na base — apenas interpretação para apresentação.
 */

export type DescriptionSection = {
  title: string;
  paragraphs: string[];
  listItems?: string[];
};

export type ParsedPropertyDescription =
  | { kind: "html"; html: string }
  | { kind: "sections"; sections: DescriptionSection[] };

const MAX_HEADER_LENGTH = 96;
const MAX_SENTENCES_PER_PARAGRAPH = 4;

const SECTION_ALIASES: ReadonlyArray<{ title: string; patterns: RegExp[] }> = [
  {
    title: "Sobre o imóvel",
    patterns: [
      /^sobre\s+o\s+im[oó]vel/i,
      /^descri[çc][aã]o/i,
      /^caracter[ií]sticas\s+gerais/i,
    ],
  },
  {
    title: "Localização",
    patterns: [
      /^localiza[çc][aã]o/i,
      /^acesso\s+e?\s*localiza[çc][aã]o/i,
      /^localiza[çc][aã]o\s+e\s+acesso/i,
    ],
  },
  {
    title: "Infraestrutura",
    patterns: [/^infraestrutura/i, /^benfeitorias/i, /^melhoramentos/i],
  },
  {
    title: "Produção",
    patterns: [
      /^produ[çc][aã]o/i,
      /^atividade\s+(agr[ií]cola|pecu[aá]ria)/i,
      /^lavoura/i,
    ],
  },
  {
    title: "Recursos naturais",
    patterns: [
      /^recursos\s+naturais/i,
      /^recursos\s+h[ií]dricos/i,
      /^vegeta[çc][aã]o/i,
    ],
  },
  {
    title: "Energia",
    patterns: [/^energia\b/i, /^abastecimento\s+el[eé]trico/i],
  },
  {
    title: "Potencial de investimento",
    patterns: [
      /^potencial\s+de\s+investimento/i,
      /^potencial\s+investimento/i,
      /^potencial\s+econ[oô]mico/i,
    ],
  },
  {
    title: "Situação legal",
    patterns: [
      /^situa[çc][aã]o\s+legal/i,
      /^documenta[çc][aã]o/i,
      /^registro\b/i,
      /^matr[ií]cula/i,
    ],
  },
  {
    title: "Valor",
    patterns: [/^valor\b/i, /^pre[çc]o\b/i, /^investimento\s+total/i],
  },
];

function countWords(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Cabeçalho só se a linha for título (sem frase após dois pontos).
 */
function matchSectionTitle(line: string): string | null {
  const trimmed = line.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_HEADER_LENGTH) {
    return null;
  }
  if (/[.!?]\s+[A-ZÀ-Ú]/.test(trimmed)) return null;

  const colonIdx = trimmed.indexOf(":");
  if (colonIdx !== -1) {
    const after = trimmed.slice(colonIdx + 1).trim();
    if (after.length > 2) return null;
  }

  const withoutColon = trimmed.replace(/:\s*$/, "").trim();

  for (const { title, patterns } of SECTION_ALIASES) {
    for (const re of patterns) {
      if (re.test(withoutColon) || re.test(trimmed)) {
        return title;
      }
    }
  }
  return null;
}

export function isLikelyHtml(s: string): boolean {
  const t = s.trim();
  if (t.length < 3) return false;
  return /<\/?[a-z][\s\S]*>/i.test(t);
}

export function basicSanitizePropertyHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/javascript:/gi, "");
}

export function splitIntoSentenceChunks(
  text: string,
  maxSentences: number
): string[] {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return [];

  const parts = cleaned.split(/(?<=[.!?])\s+/).filter(Boolean);
  const chunks: string[] = [];
  let buf: string[] = [];

  for (const part of parts) {
    buf.push(part);
    if (buf.length >= maxSentences) {
      chunks.push(buf.join(" "));
      buf = [];
    }
  }
  if (buf.length > 0) chunks.push(buf.join(" "));
  return chunks;
}

function splitBodyIntoParagraphs(body: string): string[] {
  const normalized = body.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const blocks = normalized
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);
  const out: string[] = [];

  for (const block of blocks) {
    if (countWords(block) <= 90) {
      out.push(block);
      continue;
    }
    out.push(...splitIntoSentenceChunks(block, MAX_SENTENCES_PER_PARAGRAPH));
  }

  return out;
}

function splitBodyIntoParagraphsAndLists(body: string): {
  paragraphs: string[];
  listItems?: string[];
} {
  const rawLines = body.split(/\n/);
  const textChunks: string[] = [];
  const bullets: string[] = [];
  let textBuf: string[] = [];

  for (const line of rawLines) {
    const t = line.trim();
    if (!t) {
      if (textBuf.length) {
        textChunks.push(textBuf.join(" "));
        textBuf = [];
      }
      continue;
    }
    const bullet =
      /^[-•*]\s+(.+)$/.exec(t) ?? /^\d+[.)]\s+(.+)$/.exec(t);
    if (bullet) {
      if (textBuf.length) {
        textChunks.push(textBuf.join(" "));
        textBuf = [];
      }
      bullets.push(bullet[1]!.trim());
    } else {
      textBuf.push(t);
    }
  }
  if (textBuf.length) textChunks.push(textBuf.join(" "));

  const paragraphs = textChunks
    .flatMap((chunk) => {
      const split = splitBodyIntoParagraphs(chunk);
      return split.length > 0 ? split : [chunk];
    })
    .filter(Boolean);

  return {
    paragraphs,
    listItems: bullets.length > 0 ? bullets : undefined,
  };
}

function parsePlainText(raw: string): ParsedPropertyDescription {
  const lines = raw.split(/\r?\n/);
  let currentTitle = "Sobre o imóvel";
  const sectionBuffers = new Map<string, string[]>();

  const pushLine = (title: string, line: string) => {
    if (!sectionBuffers.has(title)) sectionBuffers.set(title, []);
    sectionBuffers.get(title)!.push(line);
  };

  for (const line of lines) {
    const trimmed = line.trim();
    const title = matchSectionTitle(trimmed);
    const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
    if (
      title &&
      wordCount <= 14 &&
      trimmed.length <= MAX_HEADER_LENGTH
    ) {
      currentTitle = title;
      continue;
    }
    pushLine(currentTitle, line);
  }

  const orderIndex = new Map(
    SECTION_ALIASES.map((s, i) => [s.title, i] as const)
  );

  const sections: DescriptionSection[] = [];

  for (const [key, buf] of sectionBuffers) {
    const body = buf.join("\n").trim();
    if (!body) continue;
    const { paragraphs, listItems } = splitBodyIntoParagraphsAndLists(body);
    const hasContent =
      paragraphs.length > 0 || (listItems !== undefined && listItems.length > 0);
    if (!hasContent) continue;
    sections.push({ title: key, paragraphs, listItems });
  }

  if (sections.length === 0) {
    const { paragraphs, listItems } = splitBodyIntoParagraphsAndLists(raw.trim());
    return {
      kind: "sections",
      sections: [
        { title: "Sobre o imóvel", paragraphs, listItems },
      ],
    };
  }

  sections.sort((a, b) => {
    const ia = orderIndex.get(a.title) ?? 100;
    const ib = orderIndex.get(b.title) ?? 100;
    if (ia !== ib) return ia - ib;
    return a.title.localeCompare(b.title, "pt-BR");
  });

  return { kind: "sections", sections };
}

export function parsePropertyDescription(raw: string): ParsedPropertyDescription {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { kind: "sections", sections: [] };
  }

  if (isLikelyHtml(trimmed)) {
    return { kind: "html", html: basicSanitizePropertyHtml(trimmed) };
  }

  return parsePlainText(trimmed);
}

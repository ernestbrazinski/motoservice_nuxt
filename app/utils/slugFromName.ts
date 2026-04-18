/**
 * Build an English kebab-case slug from a human-readable title or name.
 * Cyrillic is transliterated; Latin accents are stripped; only [a-z0-9-] remain.
 */

const CYRILLIC_TO_LATIN: Readonly<Record<string, string>> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "yo",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
  і: "i",
  ї: "yi",
  є: "ye",
  ґ: "g",
  ў: "u",
  җ: "zh",
  ә: "a",
  ө: "o",
  ү: "u",
  қ: "q",
  ң: "n",
  ғ: "g",
  һ: "h",
};

function stripLatinDiacritics(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{M}+/gu, "")
    .normalize("NFC");
}

/**
 * @param raw — произвольная строка (RU/EN/смешанный текст)
 * @returns kebab-case латиница, например `motornoe-maslo-5w40`; пустая строка если нечего сохранить
 */
export function slugifyToKebabCase(raw: string): string {
  const lower = stripLatinDiacritics(raw.trim().toLowerCase());
  let out = "";
  for (const ch of lower) {
    const mapped = CYRILLIC_TO_LATIN[ch];
    if (mapped !== undefined) {
      out += mapped;
      continue;
    }
    if (/[a-z0-9]/.test(ch)) {
      out += ch;
      continue;
    }
    if (/[\s/._+]+/.test(ch) || ch === "-") {
      out += "-";
    }
  }
  const t = out.replace(/-+/g, "-").replace(/^-+|-+$/g, "");
  return t || "";
}

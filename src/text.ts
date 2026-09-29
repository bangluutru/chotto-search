/**
 * So khớp chữ dùng chung cho mọi ô tìm kiếm của Chotto.
 *
 * Một bộ duy nhất, để "thue" khớp "thuế" ở mọi site như nhau. Trước đây mỗi
 * site tự viết một bản và mỗi bản sai một kiểu: bản quên đ→d, bản bỏ luôn dấu
 * ゛ của kana (がくせい thành かくせい, khớp nhầm), bản không gộp chữ toàn
 * khổ/nửa khổ. Phần kana/romaji lấy từ jlpt-guru (search-match.ts), nơi nó đã
 * chạy thật và có test.
 *
 * Quy tắc dấu tiếng Việt: truy vấn KHÔNG dấu thì bỏ qua dấu ("me" khớp "mẹ",
 * "mè", "me"); truy vấn CÓ dấu thì khớp đúng dấu ("mẹ" chỉ khớp "mẹ") — người
 * đã chịu gõ dấu là muốn đúng chữ đó.
 */

/** Katakana (ァ..ヶ) → hiragana. Giữ nguyên ー và mọi thứ khác. */
export function toHiragana(s: string): string {
  let out = '';
  for (const ch of s) {
    const code = ch.charCodeAt(0);
    out += code >= 0x30a1 && code <= 0x30f6 ? String.fromCharCode(code - 0x60) : ch;
  }
  return out;
}

/**
 * Dạng chuẩn để so, GIỮ dấu: NFKC (ｴｲ→エイ, Ａ→a), chữ thường, katakana →
 * hiragana, gộp khoảng trắng.
 */
export function normalizeText(input: unknown): string {
  if (input == null) return '';
  return toHiragana(String(input).normalize('NFKC').toLowerCase()).replace(/\s+/g, ' ').trim();
}

/**
 * Bỏ dấu Latin (thanh điệu, mũ, móc tiếng Việt) và đ→d.
 *
 * Chỉ bỏ dấu trong khoảng U+0300–U+036F. Dấu ゛゜ của kana sau NFD là U+3099/
 * U+309A — nằm ngoài khoảng đó nên được giữ, rồi NFC ghép lại như cũ.
 */
export function foldDiacritics(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .normalize('NFC');
}

/** normalizeText + foldDiacritics: dạng "bỏ hết dấu" để so với truy vấn không dấu. */
export function foldText(input: unknown): string {
  return foldDiacritics(normalizeText(input));
}

// ---------------------------------------------------------------- romaji

const ROMAJI: Record<string, string> = {
  a: 'あ', i: 'い', u: 'う', e: 'え', o: 'お',
  ka: 'か', ki: 'き', ku: 'く', ke: 'け', ko: 'こ',
  sa: 'さ', si: 'し', shi: 'し', su: 'す', se: 'せ', so: 'そ',
  ta: 'た', ti: 'ち', chi: 'ち', tu: 'つ', tsu: 'つ', te: 'て', to: 'と',
  na: 'な', ni: 'に', nu: 'ぬ', ne: 'ね', no: 'の',
  ha: 'は', hi: 'ひ', hu: 'ふ', fu: 'ふ', he: 'へ', ho: 'ほ',
  ma: 'ま', mi: 'み', mu: 'む', me: 'め', mo: 'も',
  ya: 'や', yu: 'ゆ', yo: 'よ',
  ra: 'ら', ri: 'り', ru: 'る', re: 'れ', ro: 'ろ',
  la: 'ら', li: 'り', lu: 'る', le: 'れ', lo: 'ろ',
  wa: 'わ', wo: 'を', "n'": 'ん',
  ga: 'が', gi: 'ぎ', gu: 'ぐ', ge: 'げ', go: 'ご',
  za: 'ざ', zi: 'じ', ji: 'じ', zu: 'ず', ze: 'ぜ', zo: 'ぞ',
  da: 'だ', di: 'ぢ', du: 'づ', de: 'で', do: 'ど',
  ba: 'ば', bi: 'び', bu: 'ぶ', be: 'べ', bo: 'ぼ',
  pa: 'ぱ', pi: 'ぴ', pu: 'ぷ', pe: 'ぺ', po: 'ぽ',
  kya: 'きゃ', kyu: 'きゅ', kyo: 'きょ',
  sha: 'しゃ', shu: 'しゅ', sho: 'しょ', she: 'しぇ', sya: 'しゃ', syu: 'しゅ', syo: 'しょ',
  cha: 'ちゃ', chu: 'ちゅ', cho: 'ちょ', che: 'ちぇ', tya: 'ちゃ', tyu: 'ちゅ', tyo: 'ちょ',
  nya: 'にゃ', nyu: 'にゅ', nyo: 'にょ',
  hya: 'ひゃ', hyu: 'ひゅ', hyo: 'ひょ',
  mya: 'みゃ', myu: 'みゅ', myo: 'みょ',
  rya: 'りゃ', ryu: 'りゅ', ryo: 'りょ',
  gya: 'ぎゃ', gyu: 'ぎゅ', gyo: 'ぎょ',
  ja: 'じゃ', ju: 'じゅ', jo: 'じょ', je: 'じぇ', jya: 'じゃ', jyu: 'じゅ', jyo: 'じょ',
  zya: 'じゃ', zyu: 'じゅ', zyo: 'じょ',
  bya: 'びゃ', byu: 'びゅ', byo: 'びょ',
  pya: 'ぴゃ', pyu: 'ぴゅ', pyo: 'ぴょ',
  fa: 'ふぁ', fi: 'ふぃ', fe: 'ふぇ', fo: 'ふぉ',
  '-': 'ー',
};

const VOWELS = 'aiueo';

/**
 * Romaji Hepburn/kunrei → hiragana, hoặc null nếu có phần không phải romaji.
 * Phụ âm đôi thành っ ("kitte" → きって); "n" trước phụ âm hoặc ở cuối thành ん.
 */
export function romajiToHiragana(input: string): string | null {
  const s = input.toLowerCase().replace(/\s+/g, '');
  if (!s || !/^[a-z'-]+$/.test(s)) return null;
  let out = '';
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    const next = s[i + 1];
    if (next === c && c !== 'n' && !VOWELS.includes(c) && c !== '-' && c !== "'") {
      out += 'っ';
      i += 1;
      continue;
    }
    if (c === 'n' && next === 'n') {
      // "nn" là ん; "konnichi" là こん + にち: n thứ hai mở âm tiết khi sau nó là nguyên âm/y.
      const after = s[i + 2];
      out += 'ん';
      i += after !== undefined && (VOWELS.includes(after) || after === 'y') ? 1 : 2;
      continue;
    }
    if (c === 't' && next === 'c' && s[i + 2] === 'h') {
      out += 'っ'; // "matcha" → まっちゃ
      i += 1;
      continue;
    }
    let matched = false;
    for (const len of [3, 2, 1]) {
      const chunk = s.slice(i, i + len);
      if (chunk.length === len && ROMAJI[chunk] !== undefined) {
        out += ROMAJI[chunk];
        i += len;
        matched = true;
        break;
      }
    }
    if (matched) continue;
    if (c === 'n' && (next === undefined || (!VOWELS.includes(next) && next !== 'y'))) {
      out += 'ん';
      i += 1;
      continue;
    }
    return null;
  }
  return out;
}

// ---------------------------------------------------------------- truy vấn

const KANA_ONLY = /^[ぁ-ゟー]+$/;

export interface PreparedQuery {
  /** Dạng chuẩn, giữ dấu. */
  n: string;
  /** Dạng bỏ dấu. */
  folded: string;
  /** Người đọc có gõ dấu tiếng Việt không. */
  hasDiacritics: boolean;
  /** Các từ để so (theo n nếu có dấu, theo folded nếu không). */
  tokens: string[];
  /** Truy vấn dưới dạng kana: chính nó nếu là kana, bản chuyển từ romaji, hoặc null. */
  kana: string | null;
}

/** Chuẩn bị truy vấn một lần, dùng lại cho mọi mục. Rỗng → null. */
export function prepareQuery(raw: unknown): PreparedQuery | null {
  const n = normalizeText(raw);
  if (!n) return null;
  const folded = foldDiacritics(n);
  const hasDiacritics = folded !== n;
  const compact = n.replace(/\s+/g, '');
  const kana = KANA_ONLY.test(compact) ? compact : romajiToHiragana(n);
  return { n, folded, hasDiacritics, tokens: (hasDiacritics ? n : folded).split(' '), kana };
}

/**
 * Một đoạn chữ có khớp truy vấn không: mọi từ của truy vấn đều có mặt (không
 * cần liền nhau, không cần đúng thứ tự — "bang lai doi" khớp "Đổi bằng lái"),
 * hoặc chữ chứa dạng kana của truy vấn ("eikyou" khớp "えいきょう").
 */
export function matchesQuery(text: unknown, query: PreparedQuery | string | null): boolean {
  const q = typeof query === 'string' ? prepareQuery(query) : query;
  if (!q) return true;
  const n = normalizeText(text);
  const hay = q.hasDiacritics ? n : foldDiacritics(n);
  if (q.tokens.every((t) => hay.includes(t))) return true;
  return q.kana !== null && n.replace(/\s+/g, '').includes(q.kana);
}

export interface RankOptions<T> {
  /**
   * Các trường để so, theo thứ tự ưu tiên — trường đầu (thường là tiêu đề)
   * khớp thì xếp trước. Mỗi hàm trả chuỗi hoặc mảng chuỗi.
   */
  fields: Array<(item: T) => unknown>;
  /** Chỉ lọc, giữ nguyên thứ tự gốc — khi trang có cách sắp xếp riêng. */
  keepOrder?: boolean;
  /** Cắt bớt sau khi xếp. */
  limit?: number;
}

function joinField(value: unknown): string {
  return Array.isArray(value) ? value.join(' ') : value == null ? '' : String(value);
}

/**
 * Lọc và xếp hạng một danh sách. Mục khớp khi truy vấn khớp chuỗi gộp mọi
 * trường của nó; mục khớp trọn ở trường ưu tiên cao hơn đứng trước; cùng hạng
 * thì giữ thứ tự gốc. Truy vấn rỗng trả lại nguyên danh sách.
 */
export function rankItems<T>(items: readonly T[], query: unknown, opts: RankOptions<T>): T[] {
  const q = prepareQuery(query);
  if (!q) return opts.limit ? items.slice(0, opts.limit) : [...items];

  const scored: Array<{ item: T; rank: number; index: number }> = [];
  items.forEach((item, index) => {
    const texts = opts.fields.map((f) => joinField(f(item)));
    if (!matchesQuery(texts.join(' '), q)) return;
    const whole = texts.findIndex((text) => matchesQuery(text, q));
    scored.push({ item, rank: whole === -1 ? texts.length : whole, index });
  });

  if (!opts.keepOrder) scored.sort((a, b) => a.rank - b.rank || a.index - b.index);
  const out = scored.map((s) => s.item);
  return opts.limit ? out.slice(0, opts.limit) : out;
}

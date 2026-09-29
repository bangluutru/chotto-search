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
export declare function toHiragana(s: string): string;
/**
 * Dạng chuẩn để so, GIỮ dấu: NFKC (ｴｲ→エイ, Ａ→a), chữ thường, katakana →
 * hiragana, gộp khoảng trắng.
 */
export declare function normalizeText(input: unknown): string;
/**
 * Bỏ dấu Latin (thanh điệu, mũ, móc tiếng Việt) và đ→d.
 *
 * Chỉ bỏ dấu trong khoảng U+0300–U+036F. Dấu ゛゜ của kana sau NFD là U+3099/
 * U+309A — nằm ngoài khoảng đó nên được giữ, rồi NFC ghép lại như cũ.
 */
export declare function foldDiacritics(s: string): string;
/** normalizeText + foldDiacritics: dạng "bỏ hết dấu" để so với truy vấn không dấu. */
export declare function foldText(input: unknown): string;
/**
 * Romaji Hepburn/kunrei → hiragana, hoặc null nếu có phần không phải romaji.
 * Phụ âm đôi thành っ ("kitte" → きって); "n" trước phụ âm hoặc ở cuối thành ん.
 */
export declare function romajiToHiragana(input: string): string | null;
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
export declare function prepareQuery(raw: unknown): PreparedQuery | null;
/**
 * Một đoạn chữ có khớp truy vấn không: mọi từ của truy vấn đều có mặt (không
 * cần liền nhau, không cần đúng thứ tự — "bang lai doi" khớp "Đổi bằng lái"),
 * hoặc chữ chứa dạng kana của truy vấn ("eikyou" khớp "えいきょう").
 */
export declare function matchesQuery(text: unknown, query: PreparedQuery | string | null): boolean;
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
/**
 * Lọc và xếp hạng một danh sách. Mục khớp khi truy vấn khớp chuỗi gộp mọi
 * trường của nó; mục khớp trọn ở trường ưu tiên cao hơn đứng trước; cùng hạng
 * thì giữ thứ tự gốc. Truy vấn rỗng trả lại nguyên danh sách.
 */
export declare function rankItems<T>(items: readonly T[], query: unknown, opts: RankOptions<T>): T[];

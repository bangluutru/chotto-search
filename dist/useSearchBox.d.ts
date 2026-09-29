import { type ChangeEvent, type FormEvent, type KeyboardEvent, type ReactNode, type RefObject } from 'react';
/** Một dòng gợi ý. Mọi ô tìm kiếm của Chotto trả về đúng dạng này. */
export interface SearchItem {
    /** Khoá duy nhất trong danh sách. */
    key: string;
    title: string;
    /** Dòng nhỏ dưới tiêu đề: loại ("Bài viết"), cấp độ, mô tả ngắn… */
    subtitle?: ReactNode;
    /** URL ảnh icon, hoặc một phần tử React. */
    icon?: string | ReactNode;
    /** Chọn mục thì đi đâu. Trong site thì app tự điều hướng qua `onChoose`. */
    href?: string;
    /** Mở ở tab mới (công cụ Toolio, trang ngoài). */
    external?: boolean;
    /** Tên nhóm ("Bài viết", "Kanji"…): bảng gợi ý in tiêu đề nhóm khi nhóm đổi. */
    group?: string;
    /** Dữ liệu tuỳ ý để `onChoose` dùng. */
    data?: unknown;
}
/**
 * - `suggest`: bảng gợi ý thả xuống; Enter không chọn gợi ý → `onSubmit`
 *   (thường là mở trang kết quả), ô được xoá.
 * - `filter`: ô lọc danh sách ngay bên dưới; từ khoá được giữ, Enter không
 *   chọn gợi ý chỉ đóng bảng.
 * - `plain`: không có bảng gợi ý (trang kết quả đã tự hiện kết quả); từ
 *   khoá được giữ.
 */
export type SearchMode = 'suggest' | 'filter' | 'plain';
export interface UseSearchBoxOptions<T extends SearchItem = SearchItem> {
    mode?: SearchMode;
    /** Trả danh sách gợi ý cho một truy vấn đã trim (không rỗng). */
    search?: (query: string) => T[];
    /** Người đọc chọn một gợi ý. Mặc định: đi tới `item.href`. */
    onChoose?: (item: T) => void;
    /** Enter không chọn gợi ý nào, hoặc bấm dòng "Xem tất cả". */
    onSubmit?: (query: string) => void;
    /** Nhận từ khoá mỗi lần đổi — trang lọc danh sách dùng nó. */
    onQueryChange?: (query: string) => void;
    /** Từ khoá ban đầu (ví dụ đọc từ `?q=` khi vừa mở trang). */
    initialQuery?: string;
    /**
     * Hiện bảng gợi ý cả khi ô còn trống (bảng lệnh ⌘K: mở ra là thấy danh
     * sách). Khi đó `search` được gọi với chuỗi rỗng.
     */
    showOnEmpty?: boolean;
    /**
     * Có dòng cuối "Xem tất cả" không. Mặc định có. Tắt thì phím ↑/↓ cũng không
     * dừng ở dòng đó nữa (SearchBox tự tắt khi có `hideSeeAll`).
     */
    seeAll?: boolean;
    /**
     * Chọn sẵn dòng đầu mỗi khi danh sách đổi, để Enter mở ngay kết quả đầu
     * (bảng lệnh). Mặc định không: Enter mà chưa chọn gì là "xem tất cả".
     */
    activateFirst?: boolean;
    /**
     * Vùng tính là "bên trong" khi bấm chuột. Mặc định là form của ô. Đặt thành
     * cả hộp thoại khi trong đó có nút lọc hay bảng gợi ý đặt ở chỗ khác — bấm
     * vào đó không đóng bảng.
     */
    boundaryRef?: RefObject<HTMLElement | null>;
    /**
     * Phím riêng của app, chạy TRƯỚC xử lý của gói. Gọi `e.preventDefault()` thì
     * gói bỏ qua phím đó. Ví dụ ⌘/Ctrl+Enter trên dòng `state.active`.
     */
    /**
     * Enter mà chưa chọn dòng nào: vẫn để bảng mở sau `onSubmit` (bảng lệnh,
     * danh sách là nội dung chính). Mặc định đóng.
     */
    keepOpenOnSubmit?: boolean;
    onKeyDown?: (e: KeyboardEvent<HTMLInputElement>, ctx: {
        active: T | null;
        query: string;
    }) => void;
    /**
     * Đổi giá trị này (thường là pathname) thì ô tự đóng và xoá. Hook không
     * phụ thuộc router nào — mỗi app tự truyền.
     */
    resetKey?: unknown;
}
/**
 * Toàn bộ hành vi của một ô tìm kiếm Chotto: từ khoá, gợi ý theo từng phím
 * gõ, phím ↑/↓ (đi vòng qua cả dòng "Xem tất cả"), Enter, Esc, bấm ra ngoài
 * thì đóng, combobox ARIA cho trình đọc màn hình.
 *
 * Từ khoá chỉ nằm trong state của component: hook không ghi URL, không gửi
 * đo lường. App nào muốn làm những việc đó thì làm có chủ ý trong
 * `onSubmit`/`onQueryChange`.
 */
export declare function useSearchBox<T extends SearchItem = SearchItem>(opts?: UseSearchBoxOptions<T>): {
    mode: SearchMode;
    query: string;
    trimmed: string;
    setQuery: (value: string) => void;
    open: () => void;
    close: () => void;
    showPanel: boolean;
    seeAll: boolean;
    suggestions: T[];
    active: number;
    setActive: import("react").Dispatch<import("react").SetStateAction<number>>;
    choose: (item: T) => void;
    submit: () => void;
    listId: string;
    optionId: (i: number) => string;
    containerRef: RefObject<HTMLFormElement | null>;
    inputRef: RefObject<HTMLInputElement | null>;
    inputProps: {
        role?: "combobox" | undefined;
        'aria-autocomplete'?: "list" | undefined;
        'aria-expanded'?: boolean | undefined;
        'aria-controls'?: string | undefined;
        'aria-activedescendant'?: string | undefined;
        ref: RefObject<HTMLInputElement | null>;
        value: string;
        onChange: (e: ChangeEvent<HTMLInputElement>) => void;
        onFocus: () => void;
        onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
        onCompositionStart: () => void;
        onCompositionEnd: () => void;
        autoComplete: string;
        spellCheck: boolean;
    };
    formProps: {
        ref: RefObject<HTMLFormElement | null>;
        onSubmit: (e: FormEvent<HTMLFormElement>) => void;
        role: "search";
    };
};
export type SearchBoxState<T extends SearchItem = SearchItem> = ReturnType<typeof useSearchBox<T>>;

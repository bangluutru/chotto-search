import { type InputHTMLAttributes, type ReactNode, type Ref } from 'react';
import { type SearchBoxState, type SearchItem, type UseSearchBoxOptions } from './useSearchBox.js';
import { type PanelPlacement, type SuggestLabels } from './SearchSuggestPanel.js';
export interface SearchBoxLabels extends SuggestLabels {
    /** aria-label của nút xoá. */
    clear?: string;
    /** Chữ trên nút tìm (khi `submitButton`). */
    submit?: ReactNode;
}
export interface SearchBoxViewProps<T extends SearchItem> {
    /** Trạng thái từ `useSearchBox` — dùng khi trang cần tự điều khiển ô (chip điền từ khoá…). */
    state: SearchBoxState<T>;
    /** Nhãn cho trình đọc màn hình. Bắt buộc: ô không có label nhìn thấy. */
    ariaLabel: string;
    placeholder?: string;
    labels?: SearchBoxLabels;
    /** Cỡ viên thuốc: sm 40px (thanh điều hướng), md 46px (ô lọc), lg 56px (ô chính trang chủ). */
    size?: 'sm' | 'md' | 'lg';
    placement?: PanelPlacement;
    /** Hiện ở bên phải trong ô, ví dụ "14 bài". */
    count?: ReactNode;
    /** Nút × khi có chữ. Mặc định bật. */
    clearable?: boolean;
    /** Nút "Tìm kiếm" ở cuối viên thuốc. */
    submitButton?: boolean;
    /** Thay icon kính lúp mặc định. */
    icon?: ReactNode;
    renderItem?: (item: T, ctx: {
        active: boolean;
    }) => ReactNode;
    hideSeeAll?: boolean;
    className?: string;
    /** Ref tới <input>, ví dụ để phím tắt ⌘K focus vào ô. */
    inputRef?: Ref<HTMLInputElement>;
    autoFocus?: boolean;
    id?: string;
    name?: string;
    /**
     * Không vẽ bảng gợi ý dưới ô: app tự đặt `<SearchSuggestPanel state={…}>` ở
     * chỗ khác (cạnh khung xem trước, dưới hàng nút lọc). Nhớ đặt `boundaryRef`
     * của useSearchBox bao cả chỗ đó.
     */
    hidePanel?: boolean;
    /** Thuộc tính thêm cho <input>: lang, enterKeyHint, autoCapitalize… */
    inputAttrs?: InputHTMLAttributes<HTMLInputElement>;
}
/**
 * Giao diện ô tìm kiếm Chotto, điều khiển bằng `state` từ useSearchBox. Hầu
 * hết trang dùng thẳng `<SearchBox>` bên dưới; dùng bản View này khi trang
 * cần giữ state để làm việc khác (chip gợi ý, đọc từ khoá lọc lưới…).
 */
export declare function SearchBoxView<T extends SearchItem>({ state, ariaLabel, placeholder, labels, size, placement, count, clearable, submitButton, icon, renderItem, hideSeeAll, className, inputRef, autoFocus, id, name, hidePanel, inputAttrs, }: SearchBoxViewProps<T>): import("react").JSX.Element;
export type SearchBoxProps<T extends SearchItem> = UseSearchBoxOptions<T> & Omit<SearchBoxViewProps<T>, 'state'>;
/**
 * Ô tìm kiếm Chotto dùng một dòng:
 *
 *   <SearchBox ariaLabel="Tìm bài viết" search={find} onChoose={(i) => navigate(i.href)} />
 */
export declare function SearchBox<T extends SearchItem = SearchItem>(props: SearchBoxProps<T>): import("react").JSX.Element;

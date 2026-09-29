import type { ReactNode } from 'react';
import type { SearchBoxState, SearchItem } from './useSearchBox.js';
export type PanelPlacement = 'stretch' | 'right' | 'inline';
export interface SuggestLabels {
    /** aria-label của danh sách. */
    listbox?: string;
    /** Khi không có gợi ý nào. */
    empty?: (query: string) => ReactNode;
    /** Chữ của dòng cuối. */
    seeAll?: (query: string) => ReactNode;
}
export declare const DEFAULT_SUGGEST_LABELS: Required<SuggestLabels>;
export interface SearchSuggestPanelProps<T extends SearchItem> {
    state: SearchBoxState<T>;
    /**
     * - `stretch`: rộng bằng ô (mặc định);
     * - `right`: neo mép phải, rộng sang trái — cho ô nằm sát mép phải màn hình;
     * - `inline`: không thả nổi, nằm liền dưới ô (trong modal/command palette).
     */
    placement?: PanelPlacement;
    labels?: SuggestLabels;
    /** Tự vẽ một dòng thay cho icon + tiêu đề + dòng phụ mặc định. */
    renderItem?: (item: T, ctx: {
        active: boolean;
    }) => ReactNode;
    /** Ẩn dòng cuối "Xem tất cả". */
    hideSeeAll?: boolean;
}
/**
 * Bảng gợi ý thả xuống của mọi ô tìm kiếm Chotto. Phần tử cha (form của
 * SearchBox) có position: relative.
 */
export declare function SearchSuggestPanel<T extends SearchItem>({ state, placement, labels, renderItem, hideSeeAll, }: SearchSuggestPanelProps<T>): import("react").JSX.Element;

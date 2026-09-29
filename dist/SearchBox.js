'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback } from 'react';
import { useSearchBox } from './useSearchBox.js';
import { SearchSuggestPanel } from './SearchSuggestPanel.js';
import { ClearGlyph, SearchGlyph } from './SearchGlyph.js';
function setRef(ref, value) {
    if (!ref)
        return;
    if (typeof ref === 'function')
        ref(value);
    else
        ref.current = value;
}
const DEFAULT_LABELS = { clear: 'Xoá từ khoá', submit: 'Tìm kiếm' };
/**
 * Giao diện ô tìm kiếm Chotto, điều khiển bằng `state` từ useSearchBox. Hầu
 * hết trang dùng thẳng `<SearchBox>` bên dưới; dùng bản View này khi trang
 * cần giữ state để làm việc khác (chip gợi ý, đọc từ khoá lọc lưới…).
 */
export function SearchBoxView({ state, ariaLabel, placeholder, labels, size = 'md', placement = 'stretch', count, clearable = true, submitButton = false, icon, renderItem, hideSeeAll, className, inputRef, autoFocus, id, name, hidePanel = false, inputAttrs, }) {
    const l = { ...DEFAULT_LABELS, ...labels };
    const { ref: ownRef, ...inputRest } = state.inputProps;
    const mergedRef = useCallback((el) => {
        ownRef.current = el;
        setRef(inputRef, el);
    }, [ownRef, inputRef]);
    return (_jsxs("form", { ...state.formProps, className: `cs-box cs-box--${size}${className ? ` ${className}` : ''}`, children: [_jsxs("div", { className: "cs-pill", children: [_jsx("span", { className: "cs-pill-icon", children: icon ?? _jsx(SearchGlyph, { size: size === 'lg' ? 20 : size === 'sm' ? 16 : 18 }) }), _jsx("input", { ...inputAttrs, ...inputRest, ref: mergedRef, type: "search", className: "cs-input", placeholder: placeholder, "aria-label": ariaLabel, autoFocus: autoFocus, id: id, name: name }), count != null && state.trimmed && (_jsx("span", { className: "cs-count", "aria-live": "polite", children: count })), clearable && state.query && (_jsx("button", { type: "button", className: "cs-clear", "aria-label": l.clear, onClick: () => {
                            state.setQuery('');
                            state.close();
                            state.inputRef.current?.focus();
                        }, children: _jsx(ClearGlyph, {}) })), submitButton && (_jsxs("button", { type: "submit", className: "cs-submit", children: [_jsx(SearchGlyph, { size: 15 }), _jsx("span", { className: "cs-submit-label", children: l.submit })] }))] }), state.showPanel && !hidePanel && (_jsx(SearchSuggestPanel, { state: state, placement: placement, labels: labels, renderItem: renderItem, hideSeeAll: hideSeeAll }))] }));
}
/**
 * Ô tìm kiếm Chotto dùng một dòng:
 *
 *   <SearchBox ariaLabel="Tìm bài viết" search={find} onChoose={(i) => navigate(i.href)} />
 */
export function SearchBox(props) {
    const { mode, search, onChoose, onSubmit, onQueryChange, initialQuery, resetKey, showOnEmpty, seeAll, activateFirst, boundaryRef, onKeyDown, ...view } = props;
    const state = useSearchBox({
        mode,
        search,
        onChoose,
        onSubmit,
        onQueryChange,
        initialQuery,
        resetKey,
        showOnEmpty,
        seeAll: seeAll ?? !view.hideSeeAll,
        activateFirst,
        boundaryRef,
        onKeyDown,
    });
    return _jsx(SearchBoxView, { state: state, ...view });
}

'use client';
import { Fragment as _Fragment, jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { SearchGlyph } from './SearchGlyph.js';
export const DEFAULT_SUGGEST_LABELS = {
    listbox: 'Gợi ý tìm kiếm',
    empty: (q) => _jsxs(_Fragment, { children: ["Ch\u01B0a th\u1EA5y n\u1ED9i dung kh\u1EDBp \u201C", q, "\u201D."] }),
    seeAll: (q) => (_jsxs(_Fragment, { children: ["Xem t\u1EA5t c\u1EA3 k\u1EBFt qu\u1EA3 cho \u201C", _jsx("strong", { children: q }), "\u201D"] })),
};
function Icon({ icon }) {
    if (!icon)
        return null;
    if (typeof icon === 'string') {
        return _jsx("img", { className: "cs-suggest-icon", src: icon, alt: "", width: 18, height: 18 });
    }
    return _jsx("span", { className: "cs-suggest-icon", children: icon });
}
/**
 * Bảng gợi ý thả xuống của mọi ô tìm kiếm Chotto. Phần tử cha (form của
 * SearchBox) có position: relative.
 */
export function SearchSuggestPanel({ state, placement = 'stretch', labels, renderItem, hideSeeAll = false, }) {
    const l = { ...DEFAULT_SUGGEST_LABELS, ...labels };
    const { suggestions, active, setActive, choose, submit, trimmed, listId, optionId } = state;
    return (_jsxs("div", { className: `cs-suggest cs-suggest--${placement}`, id: listId, role: "listbox", "aria-label": l.listbox, children: [suggestions.length === 0 && _jsx("div", { className: "cs-suggest-empty", children: l.empty(trimmed) }), suggestions.map((item, i) => {
                const showGroup = item.group && item.group !== suggestions[i - 1]?.group;
                const isActive = active === i;
                return (_jsxs("div", { className: "cs-suggest-row", children: [showGroup && (_jsx("div", { className: "cs-suggest-group", "aria-hidden": "true", children: item.group })), _jsx("div", { id: optionId(i), role: "option", "aria-selected": isActive, className: `cs-suggest-item${isActive ? ' is-active' : ''}`, 
                            // mousedown thay vì click: không để ô nhập mất focus rồi đóng bảng trước khi chọn.
                            onMouseDown: (e) => {
                                e.preventDefault();
                                choose(item);
                            }, onMouseEnter: () => setActive(i), children: renderItem ? (renderItem(item, { active: isActive })) : (_jsxs(_Fragment, { children: [_jsx(Icon, { icon: item.icon }), _jsxs("span", { className: "cs-suggest-text", children: [_jsx("span", { className: "cs-suggest-title", children: item.title }), item.subtitle && _jsx("span", { className: "cs-suggest-sub", children: item.subtitle })] })] })) })] }, item.key));
            }), !hideSeeAll && (_jsxs("div", { id: optionId(suggestions.length), role: "option", "aria-selected": active === suggestions.length, className: `cs-suggest-all${active === suggestions.length ? ' is-active' : ''}`, onMouseDown: (e) => {
                    e.preventDefault();
                    submit();
                }, onMouseEnter: () => setActive(suggestions.length), children: [_jsx(SearchGlyph, { size: 14 }), _jsx("span", { children: l.seeAll(trimmed) })] }))] }));
}

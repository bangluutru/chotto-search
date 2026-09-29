import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** Kính lúp, vẽ bằng currentColor để ăn theo màu chữ của từng app. */
export function SearchGlyph({ size = 16, className }) {
    return (_jsxs("svg", { className: className, width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", focusable: "false", children: [_jsx("circle", { cx: "11", cy: "11", r: "7" }), _jsx("path", { d: "m20 20-3.5-3.5" })] }));
}
/** Dấu ×, cho nút xoá từ khoá. */
export function ClearGlyph({ size = 14 }) {
    return (_jsx("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round", "aria-hidden": "true", focusable: "false", children: _jsx("path", { d: "M6 6l12 12M18 6 6 18" }) }));
}

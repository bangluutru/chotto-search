'use client';
import { useCallback, useDeferredValue, useEffect, useId, useMemo, useRef, useState, } from 'react';
/**
 * Toàn bộ hành vi của một ô tìm kiếm Chotto: từ khoá, gợi ý theo từng phím
 * gõ, phím ↑/↓ (đi vòng qua cả dòng "Xem tất cả"), Enter, Esc, bấm ra ngoài
 * thì đóng, combobox ARIA cho trình đọc màn hình.
 *
 * Từ khoá chỉ nằm trong state của component: hook không ghi URL, không gửi
 * đo lường. App nào muốn làm những việc đó thì làm có chủ ý trong
 * `onSubmit`/`onQueryChange`.
 */
export function useSearchBox(opts = {}) {
    const { mode = 'suggest', search, onChoose, onSubmit, onQueryChange, initialQuery = '', resetKey, } = opts;
    const listId = useId();
    const containerRef = useRef(null);
    const inputRef = useRef(null);
    const [query, setQueryState] = useState(initialQuery);
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(-1);
    // Đang ghép chữ bằng bộ gõ (IME tiếng Nhật, Telex/VNI…): Enter lúc đó là để
    // chốt chữ, không phải để tìm.
    const composing = useRef(false);
    // Giữ callback mới nhất mà không làm hiệu ứng chạy lại.
    const cb = useRef({ onChoose, onSubmit, onQueryChange });
    cb.current = { onChoose, onSubmit, onQueryChange };
    const setQuery = useCallback((value) => {
        setQueryState(value);
        cb.current.onQueryChange?.(value);
    }, []);
    const trimmed = query.trim();
    // Gõ nhanh thì React bỏ qua các lần tính giữa chừng; ô nhập không khựng.
    const deferred = useDeferredValue(trimmed);
    const suggestions = useMemo(() => (mode !== 'plain' && deferred && search ? search(deferred) : []), [mode, deferred, search]);
    const showPanel = mode !== 'plain' && open && trimmed.length > 0;
    // Dòng cuối "Xem tất cả" cũng chọn được bằng phím mũi tên.
    const optionCount = suggestions.length + 1;
    useEffect(() => setActive(-1), [deferred]);
    // Chuyển trang (resetKey đổi) thì đóng bảng và xoá ô. Bỏ qua lần đầu.
    const firstReset = useRef(true);
    useEffect(() => {
        if (firstReset.current) {
            firstReset.current = false;
            return;
        }
        setOpen(false);
        setQuery('');
    }, [resetKey, setQuery]);
    useEffect(() => {
        if (!showPanel)
            return undefined;
        const onPointerDown = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target))
                setOpen(false);
        };
        document.addEventListener('pointerdown', onPointerDown);
        return () => document.removeEventListener('pointerdown', onPointerDown);
    }, [showPanel]);
    const close = useCallback(() => {
        setOpen(false);
        setActive(-1);
    }, []);
    const submit = useCallback(() => {
        if (!trimmed)
            return;
        close();
        cb.current.onSubmit?.(trimmed);
        // Chỉ ô `suggest` rời trang sau Enter nên mới xoá. Ô `filter` đang lọc
        // lưới bên dưới, ô `plain` nằm ngay trên trang kết quả: xoá là mất từ khoá
        // người đọc vừa gõ.
        if (mode !== 'suggest')
            return;
        setQuery('');
        inputRef.current?.blur();
    }, [trimmed, mode, close, setQuery]);
    const choose = useCallback((item) => {
        close();
        if (mode === 'suggest')
            setQuery('');
        inputRef.current?.blur();
        if (cb.current.onChoose) {
            cb.current.onChoose(item);
        }
        else if (item.href) {
            if (item.external)
                window.open(item.href, '_blank', 'noopener,noreferrer');
            else
                window.location.assign(item.href);
        }
    }, [close, mode, setQuery]);
    const onKeyDown = (e) => {
        if (composing.current || e.nativeEvent.isComposing || e.keyCode === 229)
            return;
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            if (!trimmed || mode === 'plain')
                return;
            e.preventDefault();
            setOpen(true);
            const step = e.key === 'ArrowDown' ? 1 : -1;
            setActive((i) => {
                const next = i + step;
                if (next < -1)
                    return optionCount - 1;
                if (next >= optionCount)
                    return -1;
                return next;
            });
        }
        else if (e.key === 'Escape' && showPanel) {
            e.preventDefault();
            close();
        }
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (composing.current)
            return;
        if (showPanel && active >= 0 && active < suggestions.length)
            choose(suggestions[active]);
        else
            submit();
    };
    const optionId = (i) => `${listId}-opt-${i}`;
    const inputProps = {
        ref: inputRef,
        value: query,
        onChange: (e) => {
            setQuery(e.target.value);
            setOpen(true);
        },
        onFocus: () => setOpen(true),
        onKeyDown,
        onCompositionStart: () => {
            composing.current = true;
        },
        onCompositionEnd: () => {
            composing.current = false;
        },
        autoComplete: 'off',
        spellCheck: false,
        ...(mode === 'plain'
            ? {}
            : {
                role: 'combobox',
                'aria-autocomplete': 'list',
                'aria-expanded': showPanel,
                'aria-controls': listId,
                'aria-activedescendant': showPanel && active >= 0 ? optionId(active) : undefined,
            }),
    };
    return {
        mode,
        query,
        trimmed,
        setQuery,
        open: () => setOpen(true),
        close,
        showPanel,
        suggestions,
        active,
        setActive,
        choose,
        submit,
        listId,
        optionId,
        containerRef,
        inputRef,
        inputProps,
        formProps: { ref: containerRef, onSubmit: handleSubmit, role: 'search' },
    };
}

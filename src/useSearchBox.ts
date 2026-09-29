'use client';
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react';

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
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>, ctx: { active: T | null; query: string }) => void;
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
export function useSearchBox<T extends SearchItem = SearchItem>(opts: UseSearchBoxOptions<T> = {}) {
  const {
    mode = 'suggest',
    search,
    onChoose,
    onSubmit,
    onQueryChange,
    initialQuery = '',
    resetKey,
    showOnEmpty = false,
    seeAll = true,
    activateFirst = false,
    boundaryRef,
  } = opts;

  const listId = useId();
  const containerRef = useRef<HTMLFormElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [query, setQueryState] = useState(initialQuery);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  // Đang ghép chữ bằng bộ gõ (IME tiếng Nhật, Telex/VNI…): Enter lúc đó là để
  // chốt chữ, không phải để tìm.
  const composing = useRef(false);

  // Giữ callback mới nhất mà không làm hiệu ứng chạy lại.
  const cb = useRef({ onChoose, onSubmit, onQueryChange, onKeyDown: opts.onKeyDown });
  cb.current = { onChoose, onSubmit, onQueryChange, onKeyDown: opts.onKeyDown };

  const setQuery = useCallback((value: string) => {
    setQueryState(value);
    cb.current.onQueryChange?.(value);
  }, []);

  const trimmed = query.trim();
  // Gõ nhanh thì React bỏ qua các lần tính giữa chừng; ô nhập không khựng.
  const deferred = useDeferredValue(trimmed);
  const suggestions = useMemo<T[]>(
    () => (mode !== 'plain' && search && (deferred || showOnEmpty) ? search(deferred) : []),
    [mode, deferred, search, showOnEmpty]
  );
  const showPanel = mode !== 'plain' && open && (trimmed.length > 0 || showOnEmpty);
  // Dòng cuối "Xem tất cả" chỉ có khi đã gõ gì đó, và cũng chọn được bằng phím
  // mũi tên. Dòng bị ẩn thì không được tính, không thì ↓ dừng ở một dòng vô hình.
  const hasSeeAll = seeAll && trimmed.length > 0;
  const optionCount = suggestions.length + (hasSeeAll ? 1 : 0);

  // Chỉ đặt lại khi từ khoá đổi, KHÔNG theo `suggestions`: app truyền `search`
  // viết thẳng trong JSX thì mảng mới mỗi lần render, và ↓ bị xoá ngay sau khi bấm.
  const hasSuggestions = suggestions.length > 0;
  useEffect(() => setActive(activateFirst && hasSuggestions ? 0 : -1), [deferred, activateFirst, hasSuggestions]);

  // Chuyển trang (resetKey đổi) thì đóng bảng và xoá ô. So với giá trị trước
  // chứ không dùng cờ "lần đầu": StrictMode chạy hiệu ứng hai lần, cờ bị tắt
  // ở lần một và lần hai xoá mất từ khoá ban đầu (?q= trên trang kết quả).
  const lastResetKey = useRef(resetKey);
  useEffect(() => {
    if (Object.is(lastResetKey.current, resetKey)) return;
    lastResetKey.current = resetKey;
    setOpen(false);
    setQuery('');
  }, [resetKey, setQuery]);

  const close = useCallback(() => {
    setOpen(false);
    setActive(-1);
  }, []);

  // Bấm ra ngoài thì đóng VÀ bỏ dòng đang chọn. Chỉ đóng thôi thì dòng cũ còn
  // nhớ: bấm lại vào ô rồi Enter là mở gợi ý người đọc không chọn lại.
  useEffect(() => {
    if (!showPanel) return undefined;
    const onPointerDown = (e: PointerEvent) => {
      const inside = boundaryRef?.current ?? containerRef.current;
      if (inside && !inside.contains(e.target as Node)) close();
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [showPanel, close, boundaryRef]);

  const submit = useCallback(() => {
    if (!trimmed) return;
    close();
    cb.current.onSubmit?.(trimmed);
    // Chỉ ô `suggest` rời trang sau Enter nên mới xoá. Ô `filter` đang lọc
    // lưới bên dưới, ô `plain` nằm ngay trên trang kết quả: xoá là mất từ khoá
    // người đọc vừa gõ.
    if (mode !== 'suggest') return;
    setQuery('');
    inputRef.current?.blur();
  }, [trimmed, mode, close, setQuery]);

  const choose = useCallback(
    (item: T) => {
      close();
      if (mode === 'suggest') setQuery('');
      inputRef.current?.blur();
      if (cb.current.onChoose) {
        cb.current.onChoose(item);
      } else if (item.href) {
        if (item.external) window.open(item.href, '_blank', 'noopener,noreferrer');
        else window.location.assign(item.href);
      }
    },
    [close, mode, setQuery]
  );

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (composing.current || e.nativeEvent.isComposing || e.keyCode === 229) return;
    cb.current.onKeyDown?.(e, { active: active >= 0 && active < suggestions.length ? suggestions[active] : null, query: trimmed });
    if (e.defaultPrevented) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (mode === 'plain' || (!trimmed && !showOnEmpty) || optionCount === 0) return;
      e.preventDefault();
      setOpen(true);
      const step = e.key === 'ArrowDown' ? 1 : -1;
      setActive((i) => {
        const next = i + step;
        if (next < -1) return optionCount - 1;
        if (next >= optionCount) return -1;
        return next;
      });
    } else if (e.key === 'Escape' && showPanel) {
      e.preventDefault();
      close();
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (composing.current) return;
    if (showPanel && active >= 0 && active < suggestions.length) choose(suggestions[active]);
    else submit();
  };

  const optionId = (i: number) => `${listId}-opt-${i}`;

  const inputProps = {
    ref: inputRef,
    value: query,
    onChange: (e: ChangeEvent<HTMLInputElement>) => {
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
          role: 'combobox' as const,
          'aria-autocomplete': 'list' as const,
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
    seeAll: hasSeeAll,
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
    formProps: { ref: containerRef, onSubmit: handleSubmit, role: 'search' as const },
  };
}

export type SearchBoxState<T extends SearchItem = SearchItem> = ReturnType<typeof useSearchBox<T>>;

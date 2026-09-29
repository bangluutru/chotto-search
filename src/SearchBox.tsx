'use client';
import { useCallback, type InputHTMLAttributes, type ReactNode, type Ref } from 'react';
import { useSearchBox, type SearchBoxState, type SearchItem, type UseSearchBoxOptions } from './useSearchBox.js';
import { SearchSuggestPanel, type PanelPlacement, type SuggestLabels } from './SearchSuggestPanel.js';
import { ClearGlyph, SearchGlyph } from './SearchGlyph.js';

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
  renderItem?: (item: T, ctx: { active: boolean }) => ReactNode;
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

function setRef<V>(ref: Ref<V> | undefined, value: V) {
  if (!ref) return;
  if (typeof ref === 'function') ref(value);
  else (ref as { current: V }).current = value;
}

const DEFAULT_LABELS = { clear: 'Xoá từ khoá', submit: 'Tìm kiếm' };

/**
 * Giao diện ô tìm kiếm Chotto, điều khiển bằng `state` từ useSearchBox. Hầu
 * hết trang dùng thẳng `<SearchBox>` bên dưới; dùng bản View này khi trang
 * cần giữ state để làm việc khác (chip gợi ý, đọc từ khoá lọc lưới…).
 */
export function SearchBoxView<T extends SearchItem>({
  state,
  ariaLabel,
  placeholder,
  labels,
  size = 'md',
  placement = 'stretch',
  count,
  clearable = true,
  submitButton = false,
  icon,
  renderItem,
  hideSeeAll,
  className,
  inputRef,
  autoFocus,
  id,
  name,
  hidePanel = false,
  inputAttrs,
}: SearchBoxViewProps<T>) {
  const l = { ...DEFAULT_LABELS, ...labels };
  const { ref: ownRef, ...inputRest } = state.inputProps;

  const mergedRef = useCallback(
    (el: HTMLInputElement | null) => {
      ownRef.current = el;
      setRef(inputRef, el);
    },
    [ownRef, inputRef]
  );

  return (
    <form {...state.formProps} className={`cs-box cs-box--${size}${className ? ` ${className}` : ''}`}>
      <div className="cs-pill">
        <span className="cs-pill-icon">{icon ?? <SearchGlyph size={size === 'lg' ? 20 : size === 'sm' ? 16 : 18} />}</span>
        <input
          {...inputAttrs}
          {...inputRest}
          ref={mergedRef}
          type="search"
          className="cs-input"
          placeholder={placeholder}
          aria-label={ariaLabel}
          autoFocus={autoFocus}
          id={id}
          name={name}
        />
        {count != null && state.trimmed && (
          <span className="cs-count" aria-live="polite">
            {count}
          </span>
        )}
        {clearable && state.query && (
          <button
            type="button"
            className="cs-clear"
            aria-label={l.clear}
            onClick={() => {
              state.setQuery('');
              state.close();
              state.inputRef.current?.focus();
            }}
          >
            <ClearGlyph />
          </button>
        )}
        {submitButton && (
          <button type="submit" className="cs-submit">
            <SearchGlyph size={15} />
            <span className="cs-submit-label">{l.submit}</span>
          </button>
        )}
      </div>
      {state.showPanel && !hidePanel && (
        <SearchSuggestPanel
          state={state}
          placement={placement}
          labels={labels}
          renderItem={renderItem}
          hideSeeAll={hideSeeAll}
        />
      )}
    </form>
  );
}

export type SearchBoxProps<T extends SearchItem> = UseSearchBoxOptions<T> &
  Omit<SearchBoxViewProps<T>, 'state'>;

/**
 * Ô tìm kiếm Chotto dùng một dòng:
 *
 *   <SearchBox ariaLabel="Tìm bài viết" search={find} onChoose={(i) => navigate(i.href)} />
 */
export function SearchBox<T extends SearchItem = SearchItem>(props: SearchBoxProps<T>) {
  const {
    mode,
    search,
    onChoose,
    onSubmit,
    onQueryChange,
    initialQuery,
    resetKey,
    showOnEmpty,
    seeAll,
    activateFirst,
    boundaryRef,
    onKeyDown,
    ...view
  } = props;
  const state = useSearchBox<T>({
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
  return <SearchBoxView state={state} {...view} />;
}

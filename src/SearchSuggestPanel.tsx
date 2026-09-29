'use client';
import type { ReactNode } from 'react';
import type { SearchBoxState, SearchItem } from './useSearchBox.js';
import { SearchGlyph } from './SearchGlyph.js';

export type PanelPlacement = 'stretch' | 'right' | 'inline';

export interface SuggestLabels {
  /** aria-label của danh sách. */
  listbox?: string;
  /** Khi không có gợi ý nào. */
  empty?: (query: string) => ReactNode;
  /** Chữ của dòng cuối. */
  seeAll?: (query: string) => ReactNode;
}

export const DEFAULT_SUGGEST_LABELS: Required<SuggestLabels> = {
  listbox: 'Gợi ý tìm kiếm',
  empty: (q) => <>Chưa thấy nội dung khớp “{q}”.</>,
  seeAll: (q) => (
    <>
      Xem tất cả kết quả cho “<strong>{q}</strong>”
    </>
  ),
};

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
  renderItem?: (item: T, ctx: { active: boolean }) => ReactNode;
  /** Ẩn dòng cuối "Xem tất cả". */
  hideSeeAll?: boolean;
}

function Icon({ icon }: { icon: SearchItem['icon'] }) {
  if (!icon) return null;
  if (typeof icon === 'string') {
    return <img className="cs-suggest-icon" src={icon} alt="" width={18} height={18} />;
  }
  return <span className="cs-suggest-icon">{icon}</span>;
}

/**
 * Bảng gợi ý thả xuống của mọi ô tìm kiếm Chotto. Phần tử cha (form của
 * SearchBox) có position: relative.
 */
export function SearchSuggestPanel<T extends SearchItem>({
  state,
  placement = 'stretch',
  labels,
  renderItem,
  hideSeeAll = false,
}: SearchSuggestPanelProps<T>) {
  const l = { ...DEFAULT_SUGGEST_LABELS, ...labels };
  const { suggestions, active, setActive, choose, submit, trimmed, listId, optionId } = state;
  const showSeeAll = state.seeAll && !hideSeeAll;

  return (
    <div className={`cs-suggest cs-suggest--${placement}`} id={listId} role="listbox" aria-label={l.listbox}>
      {suggestions.length === 0 && trimmed && <div className="cs-suggest-empty">{l.empty(trimmed)}</div>}

      {suggestions.map((item, i) => {
        const showGroup = item.group && item.group !== suggestions[i - 1]?.group;
        const isActive = active === i;
        return (
          <div key={item.key} className="cs-suggest-row">
            {showGroup && (
              <div className="cs-suggest-group" aria-hidden="true">
                {item.group}
              </div>
            )}
            <div
              id={optionId(i)}
              role="option"
              aria-selected={isActive}
              className={`cs-suggest-item${isActive ? ' is-active' : ''}`}
              // mousedown thay vì click: không để ô nhập mất focus rồi đóng bảng trước khi chọn.
              onMouseDown={(e) => {
                e.preventDefault();
                choose(item);
              }}
              onMouseEnter={() => setActive(i)}
            >
              {renderItem ? (
                renderItem(item, { active: isActive })
              ) : (
                <>
                  <Icon icon={item.icon} />
                  <span className="cs-suggest-text">
                    <span className="cs-suggest-title">{item.title}</span>
                    {item.subtitle && <span className="cs-suggest-sub">{item.subtitle}</span>}
                  </span>
                </>
              )}
            </div>
          </div>
        );
      })}

      {showSeeAll && (
        <div
          id={optionId(suggestions.length)}
          role="option"
          aria-selected={active === suggestions.length}
          className={`cs-suggest-all${active === suggestions.length ? ' is-active' : ''}`}
          onMouseDown={(e) => {
            e.preventDefault();
            submit();
          }}
          onMouseEnter={() => setActive(suggestions.length)}
        >
          <SearchGlyph size={14} />
          <span>{l.seeAll(trimmed)}</span>
        </div>
      )}
    </div>
  );
}

export {
  toHiragana,
  normalizeText,
  foldDiacritics,
  foldText,
  romajiToHiragana,
  prepareQuery,
  matchesQuery,
  rankItems,
} from './text.js';
export type { PreparedQuery, RankOptions } from './text.js';

export { useSearchBox } from './useSearchBox.js';
export type { SearchItem, SearchMode, UseSearchBoxOptions, SearchBoxState } from './useSearchBox.js';

export { SearchBox, SearchBoxView } from './SearchBox.js';
export type { SearchBoxProps, SearchBoxViewProps, SearchBoxLabels } from './SearchBox.js';

export { SearchSuggestPanel, DEFAULT_SUGGEST_LABELS } from './SearchSuggestPanel.js';
export type { SearchSuggestPanelProps, SuggestLabels, PanelPlacement } from './SearchSuggestPanel.js';

export { SearchGlyph } from './SearchGlyph.js';

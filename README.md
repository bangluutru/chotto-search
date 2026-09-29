# @chotto/search

Ô tìm kiếm dùng chung cho **mọi site Chotto** — chottoday.com, toolio,
jlpt-guru, eikyu-up, mimane… và mọi site thêm về sau.

Nguyên tắc: **ô tìm kiếm ở đâu cũng dùng gói này.** Không site nào, trang nào
tự viết ô riêng. Cần một hành vi mới thì thêm vào đây rồi mọi nơi cùng có.

Lý do: trước khi có gói, mỗi trang một ô. Có ô bỏ dấu, có ô không; có ô vẽ hai
vòng focus lồng nhau thành khung chữ nhật xanh trong viên thuốc; có ô Enter giữa
lúc gõ tiếng Nhật là tìm luôn nửa chữ. Sửa một chỗ thì chỗ khác vẫn hỏng.

## Gói lo những gì

- **So khớp** (`text.ts`): gõ không dấu khớp chữ có dấu ("doi bang" → "Đổi
  bằng lái"); gõ có dấu thì khớp đúng dấu ("thuế" không khớp "thuê"); NFKC
  (chữ toàn góc ＶＩＳＡ); katakana = hiragana; romaji → kana ("eikyuu" khớp
  えいきゅう); mọi từ phải có nhưng không cần đúng thứ tự.
- **Hành vi** (`useSearchBox`): gợi ý theo từng phím gõ, ↑/↓ đi vòng qua cả
  dòng "Xem tất cả", Enter, Esc, bấm ra ngoài thì đóng, combobox ARIA, **bỏ
  qua phím khi đang ghép chữ bằng IME**.
- **Giao diện** (`SearchBox`, `styles.css`): viên thuốc một vòng focus duy
  nhất, nút ×, số kết quả, nút Tìm, bảng gợi ý có nhóm.

Gói **không** ghi URL, không gửi đo lường, không phụ thuộc router. App tự làm
những việc đó, có chủ ý, trong `onSubmit`/`onChoose`/`onQueryChange`.

## Cài

Repo công khai, `dist/` commit sẵn nên không cần bước build khi cài:

```bash
npm install github:bangluutru/chotto-search#v1.0.2
```

Nâng phiên bản: đổi tag trong `package.json` của app.

## Dùng

```jsx
import { SearchBox, rankItems } from '@chotto/search';
import '@chotto/search/styles.css';

const find = (q) =>
  rankItems(ARTICLES, q, { fields: [(a) => a.title, (a) => a.summary], limit: 6 }).map((a) => ({
    key: a.slug,
    title: a.title,
    subtitle: 'Bài viết',
    href: `/articles/${a.slug}`,
  }));

<SearchBox
  ariaLabel="Tìm trên Chotto"
  placeholder="Tìm bài viết, công cụ…"
  search={find}
  onChoose={(item) => navigate(item.href)}
  onSubmit={(q) => navigate(`/search?q=${encodeURIComponent(q)}`)}
  resetKey={location.pathname}
/>;
```

Ba chế độ (`mode`):

| Chế độ | Dùng khi | Enter không chọn gợi ý |
| --- | --- | --- |
| `suggest` (mặc định) | Ô tìm chung: navbar, trang chủ | `onSubmit`, ô được xoá |
| `filter` | Ô lọc danh sách ngay bên dưới | `onSubmit`, **từ khoá giữ lại** |
| `plain` | Trang kết quả đã tự hiện kết quả | `onSubmit`, từ khoá giữ lại, không có bảng gợi ý |

Trang cần giữ state (chip điền từ khoá, lọc lưới) thì tách hai phần:

```jsx
const state = useSearchBox({ mode: 'filter', search: find, onQueryChange: setQuery });
<SearchBoxView state={state} ariaLabel="Lọc công cụ" count={`${n} công cụ`} />
<button onClick={() => state.setQuery('thuế')}>thuế</button>
```

Tự vẽ từng dòng (preview kanji, cấp độ…): `renderItem={(item, { active }) => …}`.
Nhóm kết quả: đặt `item.group` — bảng tự in tiêu đề khi nhóm đổi.

Chữ giao diện mặc định là tiếng Việt; site ngôn ngữ khác truyền `labels`:

```jsx
labels={{ seeAll: (q) => `「${q}」の結果をすべて見る`, empty: () => '見つかりません', clear: 'クリア' }}
```

## Màu

Map biến `--cs-*` sang token của app, một lần, ở CSS toàn cục:

```css
:root {
  --cs-surface: var(--surface-card);
  --cs-hover: var(--surface-dim);
  --cs-border: var(--border-card);
  --cs-text: var(--text-primary);
  --cs-muted: var(--text-muted);
  --cs-accent: var(--chotto-cyan);
  --cs-focus-ring: var(--focus-ring);
}
```

Đủ bộ: `--cs-surface`, `--cs-hover`, `--cs-border`, `--cs-text`, `--cs-muted`,
`--cs-placeholder`, `--cs-accent`, `--cs-focus-ring`, `--cs-shadow`,
`--cs-panel-shadow`, `--cs-radius-panel`, `--cs-radius-item`, `--cs-button-bg`,
`--cs-button-bg-hover`, `--cs-button-text`, `--cs-font`, `--cs-height`.
Chế độ tối: đổi token của app, các biến ăn theo.

Gói chỉ dùng class `cs-*` có sẵn trong `styles.css`, nên site dùng Tailwind
không cần thêm gói vào `content`.

## Thêm site mới

1. `npm install github:bangluutru/chotto-search#<tag mới nhất>`.
2. Import `@chotto/search/styles.css` một lần, map `--cs-*` sang token.
3. Mọi ô tìm kiếm — navbar, trang danh sách, trang 404, modal — dùng
   `SearchBox`/`SearchBoxView`. Không viết `<input type="search">` tay.
4. Ghi vào CLAUDE.md (hoặc tài liệu tương đương) của site: "ô tìm kiếm dùng
   `@chotto/search`".

## Phát triển

```bash
npm test          # vitest: so khớp + hành vi bàn phím/IME/chế độ
npm run check     # typecheck + test + build + dist phải trùng với commit
```

Sửa gì trong `src/` thì `npm run build` và commit cả `dist/`. CI chạy
`npm run check`, nên quên build là đỏ. Rồi tag phiên bản mới (`v1.1.0`) và
nâng tag ở từng app.

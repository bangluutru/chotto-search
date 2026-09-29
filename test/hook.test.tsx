import { describe, expect, it, vi, afterEach } from 'vitest';
import { StrictMode } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { SearchBox } from '../src/SearchBox';
import type { SearchItem } from '../src/useSearchBox';
import { rankItems } from '../src/text';

afterEach(cleanup);

const DATA: SearchItem[] = [
  { key: 'a', title: 'Gia hạn visa', href: '/a' },
  { key: 'b', title: 'Visa vĩnh trú', href: '/b' },
  { key: 'c', title: 'Thuế cư trú', href: '/c' },
];
const find = (q: string) => rankItems(DATA, q, { fields: [(i) => i.title] });

function setup(extra: Partial<Parameters<typeof SearchBox>[0]> = {}) {
  const onChoose = vi.fn();
  const onSubmit = vi.fn();
  const onQueryChange = vi.fn();
  render(
    <SearchBox ariaLabel="Tìm" search={find} onChoose={onChoose} onSubmit={onSubmit} onQueryChange={onQueryChange} {...extra} />
  );
  const input = screen.getByRole(extra.mode === 'plain' ? 'searchbox' : 'combobox') as HTMLInputElement;
  const type = (v: string) => act(() => fireEvent.change(input, { target: { value: v } }));
  const key = (k: string, init: Record<string, unknown> = {}) => act(() => fireEvent.keyDown(input, { key: k, ...init }));
  const enter = () => act(() => fireEvent.submit(input.form!));
  return { input, type, key, enter, onChoose, onSubmit, onQueryChange };
}

describe('SearchBox — suggest', () => {
  it('gợi ý theo từng phím gõ, không dấu', () => {
    const { type } = setup();
    type('visa');
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual([
      'Gia hạn visa',
      'Visa vĩnh trú',
      'Xem tất cả kết quả cho “visa”',
    ]);
    type('cu tru');
    expect(screen.getAllByRole('option')[0].textContent).toBe('Thuế cư trú');
  });

  it('↓ rồi Enter chọn gợi ý; ô được xoá', () => {
    const { input, type, key, enter, onChoose, onSubmit } = setup();
    type('visa');
    key('ArrowDown');
    key('ArrowDown');
    expect(input.getAttribute('aria-activedescendant')).toMatch(/-opt-1$/);
    enter();
    expect(onChoose).toHaveBeenCalledWith(DATA[1]);
    expect(onSubmit).not.toHaveBeenCalled();
    expect(input.value).toBe('');
  });

  it('↑ từ đầu vòng về dòng "Xem tất cả"; Enter không chọn gì thì gửi từ khoá', () => {
    const { input, type, key, enter, onSubmit } = setup();
    type('visa');
    key('ArrowUp');
    expect(input.getAttribute('aria-activedescendant')).toMatch(/-opt-2$/);
    key('ArrowDown'); // về -1
    enter();
    expect(onSubmit).toHaveBeenCalledWith('visa');
  });

  it('Esc đóng bảng', () => {
    const { type, key } = setup();
    type('visa');
    key('Escape');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('đang gõ IME thì phím và Enter bị bỏ qua', () => {
    const { input, type, key, enter, onSubmit, onChoose } = setup();
    type('visa');
    act(() => fireEvent.compositionStart(input));
    key('ArrowDown');
    expect(input.getAttribute('aria-activedescendant')).toBeNull();
    enter();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onChoose).not.toHaveBeenCalled();
    act(() => fireEvent.compositionEnd(input));
    key('ArrowDown', { keyCode: 229 });
    expect(input.getAttribute('aria-activedescendant')).toBeNull();
  });

  it('bấm ra ngoài thì đóng', () => {
    const { type } = setup();
    type('visa');
    act(() => fireEvent.pointerDown(document.body));
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('bấm ra ngoài bỏ dòng đang chọn: quay lại Enter không mở gợi ý cũ', () => {
    const { input, type, key, enter, onChoose, onSubmit } = setup();
    type('visa');
    key('ArrowDown');
    act(() => fireEvent.pointerDown(document.body));
    act(() => fireEvent.focus(input));
    enter();
    expect(onChoose).not.toHaveBeenCalled();
    expect(onSubmit).toHaveBeenCalledWith('visa');
  });

  it('không có kết quả thì nói rõ', () => {
    const { type } = setup();
    type('zzz');
    expect(screen.getByText(/Chưa thấy nội dung khớp/)).toBeTruthy();
  });

  it('không có onChoose thì đi tới href', () => {
    const assign = vi.fn();
    const orig = window.location;
    Object.defineProperty(window, 'location', { configurable: true, value: { ...orig, assign } });
    try {
      render(<SearchBox ariaLabel="Tìm 2" search={find} />);
      const input = screen.getByLabelText('Tìm 2') as HTMLInputElement;
      act(() => fireEvent.change(input, { target: { value: 'thue' } }));
      act(() => fireEvent.mouseDown(screen.getAllByRole('option')[0]));
      expect(assign).toHaveBeenCalledWith('/c');
    } finally {
      Object.defineProperty(window, 'location', { configurable: true, value: orig });
    }
  });
});

describe('SearchBox — filter', () => {
  it('Enter giữ từ khoá, báo từng lần đổi', () => {
    const { input, type, enter, onSubmit, onQueryChange } = setup({ mode: 'filter' });
    type('visa');
    expect(onQueryChange).toHaveBeenLastCalledWith('visa');
    enter();
    expect(onSubmit).toHaveBeenCalledWith('visa');
    expect(input.value).toBe('visa');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('chọn gợi ý vẫn giữ từ khoá', () => {
    const { input, type, onChoose } = setup({ mode: 'filter' });
    type('visa');
    act(() => fireEvent.mouseDown(screen.getAllByRole('option')[0]));
    expect(onChoose).toHaveBeenCalled();
    expect(input.value).toBe('visa');
  });
});

describe('SearchBox — plain', () => {
  it('Enter gửi từ khoá và giữ nguyên trong ô', () => {
    const { input, type, enter, onSubmit } = setup({ mode: 'plain' });
    type('visa');
    enter();
    expect(onSubmit).toHaveBeenCalledWith('visa');
    expect(input.value).toBe('visa');
  });

  it('không có bảng gợi ý, không role combobox', () => {
    const { input, type } = setup({ mode: 'plain' });
    type('visa');
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(input.getAttribute('role')).toBeNull();
  });
});

describe('resetKey', () => {
  it('đổi resetKey thì xoá ô và đóng bảng; lần đầu không xoá initialQuery', () => {
    const { rerender } = render(<SearchBox ariaLabel="R" search={find} initialQuery="visa" resetKey="/a" />);
    const input = screen.getByLabelText('R') as HTMLInputElement;
    expect(input.value).toBe('visa');
    rerender(<SearchBox ariaLabel="R" search={find} initialQuery="visa" resetKey="/b" />);
    expect(input.value).toBe('');
  });
});

describe('StrictMode', () => {
  it('không xoá initialQuery khi hiệu ứng chạy hai lần', () => {
    render(
      <StrictMode>
        <SearchBox ariaLabel="S" search={find} mode="plain" initialQuery="nenkin" resetKey="/search" />
      </StrictMode>
    );
    expect((screen.getByLabelText('S') as HTMLInputElement).value).toBe('nenkin');
  });
});

describe('nút ×', () => {
  it('xoá từ khoá', () => {
    const { input, type } = setup();
    type('visa');
    act(() => fireEvent.click(screen.getByLabelText('Xoá từ khoá')));
    expect(input.value).toBe('');
  });
});

import { describe, expect, it } from 'vitest';
import { foldText, matchesQuery, normalizeText, prepareQuery, rankItems, romajiToHiragana, toHiragana } from '../src/text';

describe('chuẩn hoá', () => {
  it('NFKC, chữ thường, katakana → hiragana, gộp khoảng trắng', () => {
    expect(normalizeText('  ＶＩＳＡ   カード ')).toBe('visa かーど');
    expect(toHiragana('ビザ')).toBe('びざ');
  });
  it('bỏ dấu tiếng Việt, đ → d', () => {
    expect(foldText('Đổi bằng lái')).toBe('doi bang lai');
  });
  it('giữ dakuten khi bỏ dấu', () => {
    expect(foldText('ビザ')).toBe('びざ');
  });
});

describe('matchesQuery', () => {
  it('gõ không dấu khớp chữ có dấu', () => {
    expect(matchesQuery('Đổi bằng lái xe', 'doi bang')).toBe(true);
  });
  it('gõ có dấu thì khớp đúng dấu', () => {
    expect(matchesQuery('Thuế cư trú', 'thuế')).toBe(true);
    expect(matchesQuery('Thuê nhà', 'thuế')).toBe(false);
  });
  it('mọi từ phải có, không cần đúng thứ tự', () => {
    expect(matchesQuery('Đổi bằng lái', 'lai doi')).toBe(true);
    expect(matchesQuery('Đổi bằng lái', 'lai visa')).toBe(false);
  });
  it('katakana và hiragana khớp nhau', () => {
    expect(matchesQuery('ビザ更新', 'びざ')).toBe(true);
  });
  it('romaji khớp kana', () => {
    expect(romajiToHiragana('eikyuu')).toBe('えいきゅう');
    expect(matchesQuery('えいきゅう', 'eikyuu')).toBe(true);
  });
  it('truy vấn rỗng khớp mọi thứ', () => {
    expect(prepareQuery('   ')).toBeNull();
    expect(matchesQuery('bất kỳ', '')).toBe(true);
  });
});

describe('rankItems', () => {
  const items = [
    { t: 'Lương tối thiểu', d: 'Bảng thuế theo vùng' },
    { t: 'Thuế cư trú', d: 'Nộp theo năm' },
    { t: 'Bảo hiểm', d: 'Không liên quan' },
  ];
  const fields = [(i: (typeof items)[number]) => i.t, (i: (typeof items)[number]) => i.d];

  it('khớp ở tiêu đề xếp trước khớp ở mô tả', () => {
    expect(rankItems(items, 'thue', { fields }).map((i) => i.t)).toEqual(['Thuế cư trú', 'Lương tối thiểu']);
  });
  it('trong cùng trường, khớp nguyên cụm đứng trước khớp rời từng từ', () => {
    const tools = [{ t: 'Tự Động Hóa & Mapping Excel' }, { t: 'Lấy Hóa Đơn XML' }];
    expect(rankItems(tools, 'hoa don', { fields: [(i) => i.t] }).map((i) => i.t)).toEqual([
      'Lấy Hóa Đơn XML',
      'Tự Động Hóa & Mapping Excel',
    ]);
  });

  it('keepOrder giữ thứ tự gốc', () => {
    expect(rankItems(items, 'thue', { fields, keepOrder: true }).map((i) => i.t)).toEqual([
      'Lương tối thiểu',
      'Thuế cư trú',
    ]);
  });
  it('limit cắt sau khi xếp; truy vấn rỗng trả nguyên danh sách', () => {
    expect(rankItems(items, 'thue', { fields, limit: 1 })).toHaveLength(1);
    expect(rankItems(items, '', { fields })).toHaveLength(3);
  });
});

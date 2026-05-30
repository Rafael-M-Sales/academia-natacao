import { describe, it, expect } from 'vitest';
import { normalizeCpf, formatCpf, parsePastaPath, ADULT_LANES, CHILD_LANES } from './natacaoImport';

describe('normalizeCpf', () => {
  it('removes non-digit characters', () => {
    expect(normalizeCpf('123.456.789-00')).toBe('12345678900');
  });

  it('handles empty input', () => {
    expect(normalizeCpf('')).toBe('');
    expect(normalizeCpf(null)).toBe('');
    expect(normalizeCpf(undefined)).toBe('');
  });
});

describe('formatCpf', () => {
  it('formats 11-digit string', () => {
    expect(formatCpf('12345678900')).toBe('123.456.789-00');
  });

  it('returns original if not 11 digits', () => {
    expect(formatCpf('123')).toBe('123');
  });
});

describe('parsePastaPath', () => {
  it('parses valid path for adult swimming', () => {
    const result = parsePastaPath('NATAÇÃO/9h/2ª,4ª');
    expect(result.modality).toBe('Adulta');
    expect(result.time).toBe('09:00');
    expect(result.days).toEqual(['Seg', 'Qua']);
  });

  it('parses valid path for kids swimming', () => {
    const result = parsePastaPath('NATAÇÃO INFANTIL/15h/3ª,5ª');
    expect(result.time).toBe('15:00');
    expect(result.modality).toBe('Infantil');
    expect(result.days).toEqual(['Ter', 'Qui']);
  });
});

describe('lane constants', () => {
  it('ADULT_LANES has correct lanes', () => {
    expect(ADULT_LANES).toEqual([1, 2, 5, 6]);
  });

  it('CHILD_LANES has correct lanes', () => {
    expect(CHILD_LANES).toEqual([3, 4]);
  });
});

import { describe, it, expect } from 'vitest';
import { nextStudentId } from './api';

describe('nextStudentId', () => {
  it('returns 1 for empty list', () => {
    expect(nextStudentId([])).toBe(1);
    expect(nextStudentId(null)).toBe(1);
    expect(nextStudentId(undefined)).toBe(1);
  });

  it('returns max id + 1', () => {
    const students = [{ id: 1 }, { id: 3 }, { id: 2 }];
    expect(nextStudentId(students)).toBe(4);
  });

  it('handles non-numeric ids gracefully', () => {
    const students = [{ id: 'a' }, { id: 5 }];
    expect(nextStudentId(students)).toBe(6);
  });
});

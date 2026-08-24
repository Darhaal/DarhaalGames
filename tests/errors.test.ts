import { describe, it, expect } from 'vitest';
import { errorMessage } from '@/lib/errors';

describe('errorMessage', () => {
  it('reads .message off an Error', () => {
    expect(errorMessage(new Error('boom'))).toBe('boom');
  });

  it('passes a string through', () => {
    expect(errorMessage('plain failure')).toBe('plain failure');
  });

  /**
   * The regression this function exists for. Supabase rejections are plain
   * objects carrying message/code, not Error instances — a bare String(e) on
   * them renders "[object Object]", which is exactly what users saw in the
   * toast when lobby creation broke.
   */
  it('reads a Supabase-shaped rejection instead of stringifying the object', () => {
    const postgrestError = {
      message: 'permission denied for table lobbies',
      code: '42501',
      details: null,
      hint: null
    };

    const result = errorMessage(postgrestError);

    expect(result).not.toContain('[object Object]');
    expect(result).toContain('permission denied for table lobbies');
  });

  it('appends the SQLSTATE so an opaque failure stays diagnosable', () => {
    expect(errorMessage({ message: 'permission denied', code: '42501' }))
      .toBe('permission denied (42501)');
  });

  it('omits the code when there is none', () => {
    expect(errorMessage({ message: 'network unreachable' }))
      .toBe('network unreachable');
  });

  it('ignores a non-string message rather than trusting it', () => {
    expect(errorMessage({ message: 42 })).toBe('[object Object]');
  });

  it('ignores an empty message', () => {
    expect(errorMessage({ message: '', code: '500' })).toBe('[object Object]');
  });

  it('survives null and undefined', () => {
    expect(errorMessage(null)).toBe('null');
    expect(errorMessage(undefined)).toBe('undefined');
  });
});

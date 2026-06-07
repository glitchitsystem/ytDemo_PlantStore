import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

const mockUser = { id: 1, email: 'test@example.com', firstName: 'Test' };
const mockToken = 'fake-jwt-token';

beforeEach(() => {
  localStorage.clear();
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('AuthContext - initial state', () => {
  it('has no user and finishes loading when no token is stored', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });

  it('throws when used outside AuthProvider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth must be used within an AuthProvider'
    );
    consoleSpy.mockRestore();
  });
});

describe('AuthContext - login', () => {
  it('sets user and token on successful login', async () => {
    // First call: /api/auth/login, second call: /api/auth/me triggered by token change
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: mockToken, user: mockUser }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ user: mockUser }),
      });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    await waitFor(() => expect(result.current.user).toEqual(mockUser));
    expect(result.current.token).toBe(mockToken);
    expect(localStorage.getItem('token')).toBe(mockToken);
  });

  it('returns success: false with error message on failed login', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Invalid credentials' }),
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    let loginResult;
    await act(async () => {
      loginResult = await result.current.login('bad@example.com', 'wrong');
    });

    expect(loginResult.success).toBe(false);
    expect(loginResult.error).toBe('Invalid credentials');
    expect(result.current.user).toBeNull();
  });
});

describe('AuthContext - logout', () => {
  it('clears user, token, and localStorage on logout', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: mockToken, user: mockUser }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ user: mockUser }),
      });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });
    await waitFor(() => expect(result.current.user).toEqual(mockUser));

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });
});

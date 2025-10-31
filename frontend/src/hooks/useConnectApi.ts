import { RegisterData, LoginData, ApiResponse, ErrorResponse, User } from '../interfaces';
import { useState, useCallback, useRef, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

type JwtPayload = {
  exp: number;
};

export const useConnectApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorResponse | null>(null);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const refreshTimeoutId = useRef<number | null>(null);
  const refreshAccessTokenRef = useRef<() => Promise<void> | null>(null);

  const handleApiError = (error: unknown) => {
    const err = error as { response?: { data: ErrorResponse } };
    setError(err.response?.data || { message: 'Erro ao conectar à API' });
  };

  const scheduleRefresh = useCallback((accessToken: string) => {
    if (refreshTimeoutId.current) {
      clearTimeout(refreshTimeoutId.current);
      refreshTimeoutId.current = null;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(accessToken);
      const expiresAt = decoded.exp * 1000;
      const now = Date.now();
      const timeout = expiresAt - now - 60 * 1000;

      if (timeout > 0) {
        refreshTimeoutId.current = window.setTimeout(() => {
          refreshAccessTokenRef.current?.();
        }, timeout);
      }
    } catch (err) {
      console.error('Erro ao decodificar token para agendar refresh', err);
    }
  }, []);

  const registerUser = useCallback(async (data: RegisterData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<ApiResponse>(import.meta.env.VITE_ROTA_REGISTER, data);
      setResponse(res.data);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyEmail = useCallback(async (codigo?: string, email?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<ApiResponse>(import.meta.env.VITE_ROTA_VERIFY_EMAIL, {
        codigo,
        email,
      });
      console.log(res);
      setResponse(res.data);
      return res.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const loginUser = useCallback(
    async (data: LoginData) => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.post<ApiResponse>('/login', data);
        const { accessToken, user } = res.data || {};
        if (accessToken && user) {
          setUser({ ...user, logado: true });
          setResponse(res.data);
          scheduleRefresh(accessToken);
        } else {
          setError({ message: res.data?.message });
        }
      } catch (error) {
        handleApiError(error);
      } finally {
        setLoading(false);
      }
    },
    [scheduleRefresh]
  );

  const logoutUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<ApiResponse>(
        import.meta.env.VITE_ROTA_LOGOUT,
        {},
        {
          withCredentials: true,
        }
      );
      setUser(null);
      setResponse({ message: res.data?.message });
      if (refreshTimeoutId.current) {
        clearTimeout(refreshTimeoutId.current);
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshAccessToken = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<ApiResponse>(
        '/refresh-token',
        {},
        {
          withCredentials: true,
        }
      );
      const { accessToken, user, message } = res.data || {};
      if (accessToken && user) {
        setUser({ ...user, logado: true });
        setResponse(res.data);
        scheduleRefresh(accessToken);
      } else {
        setError({ message: message || 'Erro ao renovar token.' });
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, [scheduleRefresh]);

  const resendVerifyEmailCode = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<ApiResponse>(
        import.meta.env.VITE_ROTA_REENVIO_CODIGO_VERIFICACAO_EMAIL,
        { email: email },
        {
          withCredentials: true,
        }
      );
      setResponse(res.data);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const forgotPasswordRequest = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<ApiResponse>(
        import.meta.env.VITE_ROTA_SOLICITAR_TROCA_SENHA,
        { email: email },
        {
          withCredentials: true,
        }
      );
      setResponse(res.data);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPasswordRequest = useCallback(
    async (accessToken: string, newPassword: string, confirmNewPassword: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.post<ApiResponse>(
          `/reset-password/${accessToken}`,
          {
            newPassword: newPassword,
            confirmNewPassword: confirmNewPassword,
          },
          {
            withCredentials: true,
          }
        );
        console.log(res);
        setResponse(res.data);
        return res.data;
      } catch (error) {
        handleApiError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const reset = () => {
    setError(null);
    setResponse(null);
  };

  useEffect(() => {
    refreshAccessTokenRef.current = refreshAccessToken;
  }, [refreshAccessToken]);

  useEffect(() => {
    return () => {
      if (refreshTimeoutId.current) {
        clearTimeout(refreshTimeoutId.current);
      }
    };
  }, [scheduleRefresh]);

  return {
    registerUser,
    verifyEmail,
    loginUser,
    logoutUser,
    refreshAccessToken,
    resendVerifyEmailCode,
    forgotPasswordRequest,
    resetPasswordRequest,
    loading,
    error,
    response,
    user,
    reset,
  };
};

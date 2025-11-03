import { RegisterData, LoginData, ApiResponse, ErrorResponse } from '../interfaces';
import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.response.use(
  res => res,
  async err => {
    const originalRequest = err.config;

    // Evita loop infinito
    if (
      err.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== '/refresh-token'
    ) {
      originalRequest._retry = true;
      try {
        await api.post('/refresh-token', {}, { withCredentials: true });
        return api(originalRequest); // Repete a requisição original
      } catch (refreshError) {
        // Falha no refresh -> logout e rejeita
        const { logout } = useAuthStore.getState();
        logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(err);
  }
);


export const useUser = () => {
  const { user, login, logout } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorResponse | null>(null);
  const [response, setResponse] = useState<ApiResponse | null>(null);

  const refreshTimeoutId = useRef<number | null>(null);
  const refreshAccessTokenRef = useRef<() => Promise<void> | null>(null);

  const handleApiError = (error: unknown) => {
    const err = error as { response?: { data: ErrorResponse } };
    setError(err.response?.data || { message: 'Erro ao conectar à API' });
  };

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
        const { user } = res.data || {};
        if (user) {
          login({ ...user, logado: true });
          setResponse(res.data);
        } else {
          setError({ message: res.data?.message });
        }
      } catch (error) {
        handleApiError(error);
      } finally {
        setLoading(false);
      }
    },
    [login]
  );

  const logoutUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await api.post('/refresh-token/logout', {}, { withCredentials: true });
      logout();
      if (refreshTimeoutId.current) clearTimeout(refreshTimeoutId.current);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, [logout]);

  const refreshAccessToken = useCallback(async () => {
    try {
      const res = await api.post<ApiResponse>('/refresh-token', {}, { withCredentials: true });
      const { user } = res.data || {};
      if (user) {
        login({ ...user, logado: true });
      }
    } catch (error) {
      console.warn('Falha ao renovar token', error);
      logout();
    }
  }, [login, logout]);


  const resendVerifyEmailCode = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<ApiResponse>(
        import.meta.env.VITE_ROTA_REENVIO_CODIGO_VERIFICACAO_EMAIL,
        { email },
        { withCredentials: true }
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
        { email },
        { withCredentials: true }
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
          { newPassword, confirmNewPassword },
          { withCredentials: true }
        );
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
    return () => {
      if (refreshTimeoutId.current) clearTimeout(refreshTimeoutId.current);
    };
  }, [refreshAccessToken]);

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

import { RegisterData, LoginData, ApiResponse, ErrorResponse } from '../interfaces';
import { useState, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

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
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user_data');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const refreshTimeoutId = useRef<number | null>(null);

  const handleApiError = (error: unknown) => {
    const err = error as { response?: { data: ErrorResponse } };
    setError(err.response?.data || { message: 'Erro ao conectar à API' });
  };

  const scheduleRefresh = useCallback((token: string) => {
    if (refreshTimeoutId.current) {
      clearTimeout(refreshTimeoutId.current);
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const expiresAt = decoded.exp * 1000;
      const now = Date.now();
      const timeout = expiresAt - now - 60 * 1000;

      if (timeout > 0) {
        refreshTimeoutId.current = window.setTimeout(() => {
          refreshToken();
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
        const res = await api.post<ApiResponse>(import.meta.env.VITE_ROTA_LOGIN, data);
        const { token, user } = res.data || {};
        if (token && user) {
          localStorage.setItem('jwt_token', token);
          localStorage.setItem('user_data', JSON.stringify(user));
          setUser(user);
          setResponse(res.data);
          scheduleRefresh(token);
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
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user_data');
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

  const refreshToken = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<ApiResponse>(
        import.meta.env.VITE_ROTA_REFRESH_TOKEN,
        {},
        {
          withCredentials: true,
        }
      );
      const { token, user } = res.data || {};
      if (token && user) {
        localStorage.setItem('jwt_token', token);
        localStorage.setItem('user_data', JSON.stringify(user));
        setUser(user);
        setResponse(res.data);
        scheduleRefresh(token);
      } else {
        setError({ message: res.data?.message });
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
    async (token: string, newPassword: string, confirmNewPassword: string) => {
      setLoading(true);
      setError(null);
      console.log(token, newPassword, confirmNewPassword);
      try {
        const res = await api.post<ApiResponse>(
          `${import.meta.env.VITE_ROTA_TROCAR_SENHA}/${token}`,
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
    const token = localStorage.getItem('jwt_token');
    if (token) {
      scheduleRefresh(token);
    }
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
    refreshToken,
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

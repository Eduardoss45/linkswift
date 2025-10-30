import { useState, useCallback } from 'react';
import axios from 'axios';
import { ApiResponse, ErrorResponse, ShortenLinkData, CheckLinkResponse } from '../interfaces';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export const useLinkManager = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorResponse | null>(null);
  const [response, setResponse] = useState<ApiResponse | null>(null);

  const handleApiError = (error: unknown) => {
    const err = error as { response?: { data: ErrorResponse } };
    setError(err.response?.data || { message: 'Erro ao conectar à API' });
  };

  const shortenLink = useCallback(async (data: ShortenLinkData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<ApiResponse>(import.meta.env.VITE_ROTA_SHORTEN, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwt_token') || ''}`,
        },
      });
      setResponse(res.data);
      return res.data;
    } catch (err) {
      handleApiError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const redirectToLink = useCallback(async (key: string, senha?: string) => {
    setLoading(true);
    setError(null);
    try {
      const infoRes = await api.get<CheckLinkResponse>(`/links/${key}`);
      const linkInfo = infoRes.data;
      let redirectUrl = '';
      if (linkInfo.privado) {
        redirectUrl = `/private/${key}`;
      } else if (linkInfo.senhaNecessaria) {
        if (!senha) {
          return { needsPassword: true };
        }
        redirectUrl = `/protected/${key}?senha=${senha}`;
      } else {
        redirectUrl = `/r/${key}`;
      }
      if (!linkInfo.url && !senha) {
        return { pending: true };
      }
      window.location.href = `${import.meta.env.VITE_API_BASE_URL}${redirectUrl}`;
      return { success: true };
    } catch (err) {
      handleApiError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkLinkNeedsPassword = useCallback(async (key: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<ApiResponse>(`/links/${key}`);
      setResponse(res.data);
      return res.data;
    } catch (err) {
      handleApiError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = () => {
    setError(null);
    setResponse(null);
  };

  return {
    shortenLink,
    redirectToLink,
    checkLinkNeedsPassword,
    loading,
    error,
    response,
    reset,
  };
};

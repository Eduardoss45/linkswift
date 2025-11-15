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

type ResponseType = ApiResponse | ShortenLinkData | CheckLinkResponse | null;

export const useLinkManager = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorResponse | null>(null);
  const [response, setResponse] = useState<ResponseType>(null);

  const handleApiError = (error: unknown) => {
    const err = error as { response?: { data: ErrorResponse } };
    setError(err.response?.data || { message: 'Erro ao conectar à API' });
  };

  const shortenLink = useCallback(async (data: ShortenLinkData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<ShortenLinkData>('/links', data);

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
      const infoRes = await api.get<CheckLinkResponse>(`/check/${key}`);
      const linkInfo = infoRes.data;

      let redirectUrl: string;

      if (linkInfo.privado) {
        const res = await api.post<{ url: string }>(`/private/${key}`);
        if (!res.data.url) {
          throw new Error('Não foi possível obter a URL de redirecionamento.');
        }
        redirectUrl = res.data.url;
      } else if (linkInfo.senhaNecessaria) {
        if (!senha) {
          return { needsPassword: true };
        }
        redirectUrl = `${import.meta.env.VITE_API_BASE_URL}/protected/${key}?senha=${senha}`;
      } else {
        redirectUrl = `${import.meta.env.VITE_API_BASE_URL}/r/${key}`;
      }

      window.location.href = redirectUrl;

      return { success: true };
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Erro ao redirecionar o link.';
      setError({ message });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkLinkNeedsPassword = useCallback(async (key: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<CheckLinkResponse>(`/check/${key}`);
      setResponse(res.data);
      return res.data;
    } catch (err) {
      handleApiError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserLinks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/users/links');
      setResponse(res.data);
      return res.data;
    } catch (err) {
      handleApiError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteLink = useCallback(async (key: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.delete(`/links/${key}`);
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
    getUserLinks,
    deleteLink,
    loading,
    error,
    response,
    reset,
  };
};

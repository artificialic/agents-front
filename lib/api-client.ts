import axios from 'axios';
import { getSession } from 'next-auth/react';

const ApiClientBase = () => {
  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL
  });

  api.interceptors.request.use(async (request) => {
    if (request.headers.Authorization) return request;

    const session = await getSession();

    if (session) {
      const authHeaderValue = `Bearer ${session.user!.accessToken}`;

      request.headers.Authorization = authHeaderValue;
      api.defaults.headers.common.Authorization = authHeaderValue;
    }

    return request;
  });

  return api;
};

export const apiClient = ApiClientBase();

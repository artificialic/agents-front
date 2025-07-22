import axios from 'axios';
import { getSession } from 'next-auth/react';

const ApiClientBase = () => {
  const api = axios.create({
    baseURL: 'http://localhost:8000'
  });

  api.interceptors.request.use(async (request) => {
    if (request.headers.Authorization) return request;

    const session = await getSession();
    console.log('session', session);

    if (session) {
      const authHeaderValue = `Bearer ${session.user!.accessToken}`;

      request.headers.Authorization = authHeaderValue;
      api.defaults.headers.common.Authorization = authHeaderValue;
    }

    return request;
  });

  // TODO: implement refresh token or session expiration handling
  // api.interceptors.response.use(
  //   (response) => response,
  //   async (error: AxiosError) => {
  //     toast.error('expired session')
  //
  //     api.defaults.headers.common.Authorization = undefined
  //     await signOut({ callbackUrl: '/' })
  //
  //     return Promise.reject(error)
  //   },
  // )

  return api;
};

export const apiClient = ApiClientBase();
// import axios from 'axios';
//
// const ApiClientBase = () => {
//   const defaultToken =
//     'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjdjNjA4M2NhNTJiMmQwZGVmYTU0OGQyIiwiZXhwIjoxNzUzMzI1OTMyfQ.kXBxKYXFYrS4IdME-ZsLu79Y0s9NnYLsnoGW_g81lOg';
//
//   const api = axios.create({
//     baseURL: process.env.NEXT_PUBLIC_API_URL,
//     headers: {
//       Authorization: `Bearer ${defaultToken}`
//     }
//   });
//
//   api.interceptors.request.use((request) => {
//     if (request.headers.Authorization) return request;
//
//     const authHeaderValue = `Bearer ${defaultToken}`;
//     request.headers.Authorization = authHeaderValue;
//
//     return request;
//   });
//
//   return api;
// };
//
// export const apiClient = ApiClientBase();

export const apiClientServer = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}`,
  headers: {
    'Content-Type': 'application/json'
  }
});

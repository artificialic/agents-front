import { AxiosError } from 'axios';

export interface ApiResponse<T = any> {
  message: string;
  status_code: number;
  data: T;
  error: string | null;
}

export interface ApiAuthError {
  detail: string;
}

export interface ApiError {
  status: number;
  message: string;
  data?: any;
  originalError: AxiosError | Error;
}

export interface QueryParams {
  [key: string]: string | number | boolean | null | undefined;
}

// TODO:
// @ts-nocheck
import { apiClient } from '@/lib/api-client';
import { ApiResponse, ApiError, QueryParams, ApiAuthError } from './types';
import { AxiosRequestConfig, AxiosError } from 'axios';

/**
 * Base API Service class to standardize API calls across the application
 */
class ApiService {
  protected resourcePath: string;

  /**
   * Creates a new API service instance
   * @param resourcePath - The base resource path for this service
   */
  constructor(resourcePath: string = '') {
    this.resourcePath = resourcePath;
  }

  /**
   * Get the full endpoint URL
   * @param path - Additional path to append to resource path
   * @returns Full endpoint URL
   */
  protected getUrl(path: string = ''): string {
    // Handle paths with or without leading slash
    if (!path) {
      return this.resourcePath;
    }

    // If path already starts with /, just append it to resourcePath without adding another /
    if (path.startsWith('/')) {
      return `${this.resourcePath}${path}`;
    }

    // Otherwise add the / between resourcePath and path
    return `${this.resourcePath}/${path}`;
  }

  /**
   * Get the full response, including metadata, not just the data property
   * @param path - Path to append to resource path
   * @param params - Query parameters
   * @param config - Additional axios config
   * @returns Full API response
   */
  async getFullResponse<T = any>(
    path: string = '',
    params: QueryParams = {},
    config: AxiosRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.get<ApiResponse<T>>(this.getUrl(path), {
        params,
        ...config
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error as Error);
    }
  }

  /**
   * Perform a GET request
   * @param path - Path to append to resource path
   * @param params - Query parameters
   * @param config - Additional axios config
   * @returns API response
   */
  async get<T = any>(path: string = '', params: QueryParams = {}, config: AxiosRequestConfig = {}): Promise<T> {
    try {
      const response = await apiClient.get<ApiResponse<T>>(this.getUrl(path), {
        params,
        ...config
      });
      return response.data.data;
    } catch (error) {
      throw this.handleError(error as Error);
    }
  }

  /**
   * Perform a POST request
   * @param path - Path to append to resource path
   * @param data - Request body data
   * @param config - Additional axios config
   * @returns API response
   */
  async post<T = any, D = any>(path: string = '', data: D = {} as D, config: AxiosRequestConfig = {}): Promise<T> {
    try {
      const response = await apiClient.post<ApiResponse<T>>(this.getUrl(path), data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error as Error);
    }
  }

  /**
   * Perform a PUT request
   * @param path - Path to append to resource path
   * @param data - Request body data
   * @param config - Additional axios config
   * @returns API response
   */
  async put<T = any, D = any>(path: string = '', data: D = {} as D, config: AxiosRequestConfig = {}): Promise<T> {
    try {
      const response = await apiClient.put<ApiResponse<T>>(this.getUrl(path), data, config);
      return response.data.data;
    } catch (error) {
      throw this.handleError(error as Error);
    }
  }

  /**
   * Perform a PATCH request
   * @param path - Path to append to resource path
   * @param data - Request body data
   * @param config - Additional axios config
   * @returns API response
   */
  async patch<T = any, D = any>(path: string = '', data: D = {} as D, config: AxiosRequestConfig = {}): Promise<T> {
    try {
      const response = await apiClient.patch<ApiResponse<T>>(this.getUrl(path), data, config);
      return response.data.data;
    } catch (error) {
      throw this.handleError(error as Error);
    }
  }

  /**
   * Perform a DELETE request
   * @param path - Path to append to resource path
   * @param config - Additional axios config
   * @returns API response
   */
  async delete<T = any>(path: string = '', config: AxiosRequestConfig = {}): Promise<T> {
    try {
      const response = await apiClient.delete<ApiResponse<T>>(this.getUrl(path), config);
      return response.data.data;
    } catch (error) {
      throw this.handleError(error as Error);
    }
  }

  /**
   * Handle API errors
   * @param error - Error object
   * @returns Formatted error
   */
  protected handleError(error: Error): ApiError {
    const axiosError = error as AxiosError;
    let errorMessage = 'Unknown error occurred';

    if (axiosError.response?.data) {
      // Handle authentication error format: { detail: "Not authenticated" }
      if ((axiosError.response.data as ApiAuthError).detail) {
        errorMessage = (axiosError.response.data as ApiAuthError).detail;
      }
      // Handle standard error format where error is in the response
      else if ((axiosError.response.data as ApiResponse<any>).error) {
        errorMessage = (axiosError.response.data as ApiResponse<any>).error as string;
      }
      // Handle any other error message format
      else if ((axiosError.response.data as any).message) {
        errorMessage = (axiosError.response.data as any).message;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    const errorResponse: ApiError = {
      status: axiosError.response?.status || 500,
      message: errorMessage,
      data: axiosError.response?.data || {},
      originalError: error
    };

    console.error('API Error:', errorResponse);
    return errorResponse;
  }

  /**
   * Perform a GET request for file download (blob response)
   * @param path - Path to append to resource path
   * @param params - Query parameters
   * @param config - Additional axios config
   * @returns Blob response for file download
   */
  async getBlob(
    path: string = '',
    params: QueryParams = {},
    config: AxiosRequestConfig = {}
  ): Promise<ServiceResponse<Blob>> {
    try {
      const response = await apiClient.get(this.getUrl(path), {
        params,
        responseType: 'blob',
        ...config
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      throw this.handleError(error as Error);
    }
  }
}

export default ApiService;

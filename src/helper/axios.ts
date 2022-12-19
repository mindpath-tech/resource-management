import axios, { AxiosRequestConfig, AxiosResponse, Method } from 'axios';

import { constants } from '../constants';

/**
 * Helper class to make a rest api call from the system
 */
export class AxiosUtils {
  private static async _request<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const axiosResponse = await axios.request<T>({
      ...config,
      timeout: config.timeout || constants.AXIOS_REQUEST_TIMEOUT,
    });
    return axiosResponse;
  }

  public static async getRequest<T>(url: string, options?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const method: Method = 'GET';
    const config = {
      url,
      method: method,
      ...options,
    };
    return await AxiosUtils._request<T>(config);
  }

  public static async postRequest<T>(url: string, options: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const method: Method = 'POST';
    const config = {
      url,
      method,
      ...options,
    };
    const postResponse = await AxiosUtils._request<T>(config);
    return postResponse;
  }

  public static async putRequest<T>(url: string, options: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const method: Method = 'PUT';
    const config = {
      url,
      method,
      ...options,
    };
    const putResponse = await AxiosUtils._request<T>(config);
    return putResponse;
  }

  public static async deleteRequest<T>(url: string, options: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const method: Method = 'DELETE';
    const config = {
      url,
      method,
      ...options,
    };
    const deleteResponse = await AxiosUtils._request<T>(config);
    return deleteResponse;
  }
}

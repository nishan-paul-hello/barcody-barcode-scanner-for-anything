import axios, { AxiosInstance } from 'axios';

export class GoUpcClient {
  private axiosInstance: AxiosInstance;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.axiosInstance = axios.create({
      baseURL: 'https://go-upc.com/api/v1',
      timeout: 10000,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });
  }

  async lookupRaw(barcode: string): Promise<unknown> {
    const response = await this.axiosInstance.get(`/code/${barcode}`);
    return response.data;
  }
}

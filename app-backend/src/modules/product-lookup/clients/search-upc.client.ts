import axios, { AxiosInstance } from 'axios';

export class SearchUpcClient {
  private axiosInstance: AxiosInstance;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.axiosInstance = axios.create({
      baseURL: 'https://api.searchupc.com/v1.1',
      timeout: 10000,
    });
  }

  async lookupRaw(barcode: string): Promise<unknown> {
    const response = await this.axiosInstance.get('/', {
      params: {
        request_type: 'product',
        key: this.apiKey,
        upc: barcode,
      },
    });
    return response.data;
  }
}

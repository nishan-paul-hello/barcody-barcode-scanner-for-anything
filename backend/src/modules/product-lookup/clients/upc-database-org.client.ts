import axios, { AxiosInstance } from 'axios';

export class UpcDatabaseOrgClient {
  private axiosInstance: AxiosInstance;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.axiosInstance = axios.create({
      baseURL: 'https://api.upcdatabase.org',
      timeout: 5000,
    });
  }

  async lookupRaw(barcode: string): Promise<unknown> {
    const response = await this.axiosInstance.get(`/product/${barcode}?apikey=${this.apiKey}`);
    return response.data;
  }
}

import axios, { AxiosInstance } from 'axios';

export class OpenBeautyFactsClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: 'https://world.openbeautyfacts.org',
      timeout: 10000,
      headers: {
        'User-Agent': 'Barcody - Version 1.0',
      },
    });
  }

  async lookupRaw(barcode: string): Promise<unknown> {
    const response = await this.axiosInstance.get(`/api/v2/product/${barcode}.json`);
    return response.data;
  }
}

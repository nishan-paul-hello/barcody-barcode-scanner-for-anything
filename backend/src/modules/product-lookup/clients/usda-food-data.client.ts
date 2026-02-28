import axios, { AxiosInstance } from 'axios';

export class UsdaFoodDataClient {
  private axiosInstance: AxiosInstance;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.axiosInstance = axios.create({
      baseURL: 'https://api.nal.usda.gov/fdc/v1',
      timeout: 10000,
    });
  }

  async lookupRaw(barcode: string): Promise<unknown> {
    const response = await this.axiosInstance.get('/foods/search', {
      params: {
        query: barcode,
        api_key: this.apiKey,
      },
    });
    return response.data;
  }
}

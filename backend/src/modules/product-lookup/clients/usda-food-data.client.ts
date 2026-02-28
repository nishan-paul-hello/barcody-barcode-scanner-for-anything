import axios, { AxiosInstance } from 'axios';

export class UsdaFoodDataClient {
  private axiosInstance: AxiosInstance;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey.trim();
    this.axiosInstance = axios.create({
      baseURL: 'https://api.nal.usda.gov/fdc/v1',
      timeout: 10000,
    });
  }

  async lookupRaw(barcode: string): Promise<unknown> {
    const query = String(barcode).trim();
    if (!query) throw new Error('Barcode is required');
    try {
      const response = await this.axiosInstance.get('/foods/search', {
        params: {
          query,
          api_key: this.apiKey,
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const body = error.response?.data as { message?: string; error?: string } | undefined;
        const msg = body?.message || body?.error;
        if (status === 401 || status === 403) {
          throw new Error(
            msg ||
              'USDA FoodData Central API key is invalid or expired. Check your key in Settings.',
          );
        }
        if (status === 429) {
          throw new Error('USDA API rate limit exceeded. Try again later.');
        }
        if (status && status >= 400) {
          throw new Error(msg || `USDA API error (${status}). Check your key in Settings.`);
        }
      }
      throw error;
    }
  }
}

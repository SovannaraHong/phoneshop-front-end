export interface BrandType {
  id: number;
  name: string;
  country: string;
}
export interface BrandResponse {
  brands: BrandType[];
  total: number;
  skip: number;
  limit: number;
}

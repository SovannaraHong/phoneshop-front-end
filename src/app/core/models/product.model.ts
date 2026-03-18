export interface ProductType {
  id: number;
  name: string;
  imagePath: string;
  unit: number;
  salePrice: number;
  modelName: string;
  colorName: string;
  description: string;
  active: boolean;
  brandId: number;
}
export interface ProductResponse {
  products: ProductType[];
  total: number;
  skip: number;
  limit: number;
}

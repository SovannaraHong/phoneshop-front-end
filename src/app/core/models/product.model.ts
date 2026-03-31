export interface ProductType {
  id: number;
  name: string;
  imagePath: string;
  unit: number;
  imagePreview?: string;
  salePrice: number;
  modelId: number;
  modelName: string;

  colorId: number;
  colorName: string;

  description: string;
  typeSell: string;
  active: boolean;
  brandId: number;
}
export interface ProductResponse {
  products: ProductType[];
  total: number;
  skip: number;
  limit: number;
}

export interface type {
  id: number;
  name: string;
}

import { ProductType } from './product.model';

export interface CartItem {
  product: ProductType;
  quantity: number;
}

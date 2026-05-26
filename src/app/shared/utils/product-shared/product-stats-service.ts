import { computed, inject, Injectable, signal } from '@angular/core';
import { ProductType } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product/product-service';

@Injectable({ providedIn: 'root' })
export class ProductStatsService {
  private productService = inject(ProductService);
  private _products = signal<ProductType[]>([]);

  loadProducts() {
    this.productService.getProducts().subscribe((products) => {
      this._products.set(products);
    });
  }

  setProducts(products: ProductType[]) {
    this._products.set(products);
  }

  getProducts() {
    return this._products;
  }

  getLowStock() {
    return this._products().filter((p) => p.unit < 10);
  }

  getOutOfStock() {
    return this._products().filter((p) => p.unit < 1);
  }
}

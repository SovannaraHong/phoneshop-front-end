import { computed, inject, Injectable, signal } from '@angular/core';
import { ProductType } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product/product-service';
import { BrandService } from '../../../core/services/brand/brand-service';
import { BrandType } from '../../../core/models/brand.model';

@Injectable({ providedIn: 'root' })
export class ProductStatsService {
  private productService = inject(ProductService);
  private _products = signal<ProductType[]>([]);

  loadProducts() {
    this.productService.getProducts().subscribe((products) => {
      this._products.set(products);
    });
  }
  refresh(): void {
    this.productService.getProducts().subscribe({
      next: (list) => this._products.set(list),
      error: () => {},
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
  getDataLowStock() {
    return this._products();
  }

  getOutOfStock() {
    return this._products().filter((p) => p.unit < 1);
  }
  getStock(id: number): number {
    const product = this._products().find((p) => p.id === id);
    return product?.unit ?? 0;
  }
  getBestSeller() {
    return this._products().filter((p) => p.typeSell === 'Best Seller');
  }
}

import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ProductStatsService {
  private _products = signal<any[]>([]);

  setProducts(products: any[]): void {
    this._products.set(products);
  }

  lowStock = computed(() => this._products().filter((p) => p.unit < 10 && p.active).length);
  outOfStock = computed(() => this._products().filter((p) => p.unit < 1 && p.active).length);
}

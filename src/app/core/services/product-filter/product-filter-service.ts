import { computed, Injectable, signal } from '@angular/core';
import { ProductType } from '../../models/product.model';

// @Injectable({
//   providedIn: 'root',
// })
@Injectable()
export class ProductFilterService {
  readonly searchQuery = signal('');
  readonly selectType = signal('');
  readonly selectBrandId = signal<number | ''>('');

  filtered(products: () => ProductType[]) {
    return computed(() => {
      const q = this.searchQuery().toLowerCase().trim();
      const type = this.selectType();
      const brandId = this.selectBrandId();

      return products().filter((p) => {
        const matchSearch = !q || p.name?.toLowerCase().includes(q);
        const matchType = !type || p.typeSell === type;
        const matchBrand = brandId === '' || p.brandId === Number(brandId);
        return matchSearch && matchType && matchBrand;
      });
    });
  }

  typeSellOptions(products: () => ProductType[]) {
    return computed(() => [...new Set(products().map((p) => p.typeSell))].sort());
  }

  reset() {
    this.searchQuery.set('');
    this.selectType.set('');
    this.selectBrandId.set('');
  }
}

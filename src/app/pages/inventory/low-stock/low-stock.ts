import { Component, computed, EventEmitter, inject, Input, output, signal } from '@angular/core';
import { ProductStatsService } from '../../../shared/utils/product-shared/product-stats-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { sign } from 'chart.js/helpers';
import { toSignal } from '@angular/core/rxjs-interop';
import { BrandService } from '../../../core/services/brand/brand-service';
import { BehaviorSubject, switchMap } from 'rxjs';
import { BrandType } from '../../../core/models/brand.model';
import { ProductType } from '../../../core/models/product.model';
import { ImportProductForm } from '../../../content/import-product-form/import-product-form';

@Component({
  selector: 'app-low-stock',
  imports: [CommonModule, FormsModule, ImportProductForm],
  templateUrl: './low-stock.html',
  styleUrl: './low-stock.css',
})
export class LowStock {
  private statsService = inject(ProductStatsService);
  private brandService = inject(BrandService);
  restocked = output<void>();
  @Input() import: ProductType | null = null;

  selectBrandId = signal<number | ''>('');
  Query = signal('');
  selectType = signal('');
  selectProduct = signal<ProductType | null>(null);
  isOpenForm = signal(false);

  private refresh$ = new BehaviorSubject<void>(undefined);

  brandList = toSignal(this.refresh$.pipe(switchMap(() => this.brandService.getBrands())), {
    initialValue: [] as BrandType[],
  });

  typeSellOption = computed(() => [...new Set(this.products().map((p) => p.typeSell))].sort());

  products = computed(() => this.statsService.getLowStock());
  filteredProductLowStock = computed(() => {
    const productLowStock = this.products();
    const brandId = this.selectBrandId();
    const selectType = this.selectType();
    const searchQuery = this.Query().toLowerCase().trim();
    return productLowStock.filter((p) => {
      const matchSearch = !searchQuery || p.name?.toLowerCase().includes(searchQuery);
      const matchBrandId = brandId === '' || p.brandId === Number(brandId);
      const matchType = !selectType || p.typeSell === selectType;
      return matchSearch && matchBrandId && matchType;
    });
  });
  onImportSaved(): void {
    this.isOpenForm.set(false);
    this.selectProduct.set(null);
    this.restocked.emit();
    this.refresh$.next();
    this.statsService.refresh();
  }
  openImportProduct(product: ProductType) {
    this.selectProduct.set(product);
    this.isOpenForm.set(true);
  }

  isCloseForm() {
    this.selectProduct.set(null);
    this.isOpenForm.set(false);
  }
}

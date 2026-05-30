// low-stock.component.ts
import { Component, computed, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProductStatsService } from '../../../shared/utils/product-shared/product-stats-service';
import { BrandService } from '../../../core/services/brand/brand-service';
import { ImportProductForm } from '../../../content/import-product-form/import-product-form';
import { ProductType } from '../../../core/models/product.model';
import { BrandType } from '../../../core/models/brand.model';
import { signal } from '@angular/core';
import { ProductFilterService } from '../../../core/services/product-filter/product-filter-service';
import { SharedFilterBar } from '../../../shared/components/shared-filter-bar/shared-filter-bar';

@Component({
  selector: 'app-low-stock',
  standalone: true,
  providers: [ProductFilterService], // ← scoped instance
  imports: [CommonModule, FormsModule, ImportProductForm, SharedFilterBar],
  templateUrl: './low-stock.html',
})
export class LowStock {
  private statsService = inject(ProductStatsService);
  private brandService = inject(BrandService);
  readonly filter = inject(ProductFilterService);

  restocked = output<void>();
  isOpenForm = signal(false);
  selectProduct = signal<ProductType | null>(null);

  private refresh$ = new BehaviorSubject<void>(undefined);

  brandList = toSignal(this.refresh$.pipe(switchMap(() => this.brandService.getBrands())), {
    initialValue: [] as BrandType[],
  });

  products = computed(() => this.statsService.getLowStock());
  typeOptions = this.filter.typeSellOptions(this.products);
  filteredProducts = this.filter.filtered(this.products);

  openImportProduct(product: ProductType) {
    this.selectProduct.set(product);
    this.isOpenForm.set(true);
  }

  closeForm() {
    this.selectProduct.set(null);
    this.isOpenForm.set(false);
  }

  onImportSaved() {
    this.closeForm();
    this.restocked.emit();
    this.refresh$.next();
    this.statsService.refresh();
  }
}

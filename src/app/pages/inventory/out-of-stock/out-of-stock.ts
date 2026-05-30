import { Component, computed, inject, output, signal } from '@angular/core';
import { ProductStatsService } from '../../../shared/utils/product-shared/product-stats-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImportProductForm } from '../../../content/import-product-form/import-product-form';
import { ProductType } from '../../../core/models/product.model';
import { BehaviorSubject, single, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { BrandService } from '../../../core/services/brand/brand-service';
import { BrandType } from '../../../core/models/brand.model';
import { ProductFilterService } from '../../../core/services/product-filter/product-filter-service';
import { SharedFilterBar } from '../../../shared/components/shared-filter-bar/shared-filter-bar';

@Component({
  selector: 'app-out-of-stock',
  providers: [ProductFilterService],
  imports: [CommonModule, FormsModule, ImportProductForm, SharedFilterBar],
  templateUrl: './out-of-stock.html',
  styleUrl: './out-of-stock.css',
  standalone: true,
})
export class OutOfStock {
  private statsService = inject(ProductStatsService);
  private filter = inject(ProductFilterService);
  private brandService = inject(BrandService);
  restocked = output<void>();

  selectedProduct = signal<ProductType | null>(null);
  private refresh$ = new BehaviorSubject<void>(undefined);
  isOpen = signal(false);

  brandList = toSignal(this.refresh$.pipe(switchMap(() => this.brandService.getBrands())), {
    initialValue: [] as BrandType[],
  });
  products = computed(() => this.statsService.getOutOfStock());
  typeSellOption = this.filter.typeSellOptions(this.products);
  filteredLowStock = this.filter.filtered(this.products);

  onImportStock(product: ProductType) {
    this.isOpen.set(true);
    this.selectedProduct.set(product);
  }
  isCloseForm() {
    this.isOpen.set(false);
    this.selectedProduct.set(null);
  }
  importSave(): void {
    this.isCloseForm();
    this.restocked.emit();
    this.refresh$.next();
    this.statsService.refresh();
  }
}

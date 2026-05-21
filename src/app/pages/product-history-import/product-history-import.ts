import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  NgModule,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProductService } from '../../core/services/product/product-service';
import { ImportHistoryType } from '../../core/models/productHistoryImport.model';

@Component({
  selector: 'app-product-history-import',
  imports: [CommonModule, FormsModule],
  templateUrl: './product-history-import.html',
  styleUrl: './product-history-import.css',
})
export class ProductHistoryImport {
  private productService = inject(ProductService);

  searchQuery = signal('');
  selectedProduct = signal('');

  private refresh$ = new BehaviorSubject<void>(undefined);

  historyList = toSignal(
    this.refresh$.pipe(switchMap(() => this.productService.getImportHistory())),
    { initialValue: [] as ImportHistoryType[] },
  );

  filteredHistory = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const product = this.selectedProduct().toLowerCase();
    return this.historyList().filter((h) => {
      const matchSearch =
        !query ||
        h.product.name.toLowerCase().includes(query) ||
        h.product.model.name.toLowerCase().includes(query);
      const matchProduct = !product || h.product.name.toLowerCase().includes(product);
      return matchSearch && matchProduct;
    });
  });

  totalImports = computed(() => this.historyList().length);
  totalUnits = computed(() => this.historyList().reduce((s, h) => s + h.importUnit, 0));
  totalValue = computed(() =>
    this.historyList().reduce((s, h) => s + h.importUnit * h.pricePerUnit, 0),
  );

  uniqueProducts = computed(() =>
    [...new Set(this.historyList().map((h) => h.product.name))].sort(),
  );

  color: { name: string; hex: string }[] = [
    { name: 'Red', hex: '#EF4444' },
    { name: 'Green', hex: '#22C55E' },
    { name: 'Blue', hex: '#3B82F6' },
    { name: 'Yellow', hex: '#EAB308' },
    { name: 'Cyan', hex: '#06B6D4' },
    { name: 'Magenta', hex: '#D946EF' },
    { name: 'Black', hex: '#111111' },
    { name: 'White', hex: '#E5E7EB' },
    { name: 'Gold', hex: '#F59E0B' },
  ];

  getColorHex(colorName: string): string {
    if (!colorName) return '#9CA3AF';
    return (
      this.color.find((c) => c.name.toLowerCase() === colorName.toLowerCase())?.hex ?? '#9CA3AF'
    );
  }

  getTotal(h: ImportHistoryType): number {
    return h.importUnit * h.pricePerUnit;
  }
}

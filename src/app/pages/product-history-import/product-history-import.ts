import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProductService } from '../../core/services/product/product-service';
import { ImportHistoryType } from '../../core/models/productHistoryImport.model';
import { PageDTO } from '../../core/models/user.model';

@Component({
  selector: 'app-product-history-import',
  imports: [CommonModule, FormsModule],
  templateUrl: './product-history-import.html',
  styleUrl: './product-history-import.css',
})
export class ProductHistoryImport {
  private productService = inject(ProductService);

  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  searchQuery = signal('');
  selectedProduct = signal('');

  private refresh$ = new BehaviorSubject<{ page: number; size: number }>({
    page: 1,
    size: 10,
  });

  private pageData = toSignal(
    this.refresh$.pipe(
      switchMap(({ page, size }) => this.productService.getImportHistory(page, size)),
    ),
    {
      initialValue: {
        list: [],
        paginationDTO: {
          empty: true,
          first: true,
          last: true,
          numberOfElements: 0,
          pageNumber: 1,
          pageSize: 10,
          totalElements: 0,
          totalPage: 0,
        },
      } as PageDTO<ImportHistoryType>,
    },
  );

  importHistory = computed(() => this.pageData().list ?? []);
  pagination = computed(() => this.pageData().paginationDTO);

  filteredHistory = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const product = this.selectedProduct().toLowerCase();
    return this.importHistory().filter((h) => {
      const matchesQuery = !query || h.product.name.toLowerCase().includes(query);
      const matchesProduct = !product || h.product.name.toLowerCase() === product;
      return matchesQuery && matchesProduct;
    });
  });

  private allData = toSignal(this.productService.getImportHistory(1, 99999), {
    initialValue: {
      list: [],
      paginationDTO: { totalElements: 0 },
    } as unknown as PageDTO<ImportHistoryType>,
  });
  uniqueProducts = computed(() => {
    const names = this.allHistory().map((h) => h.product.name);
    return [...new Set(names)];
  });
  allHistory = computed(() => this.allData().list ?? []);

  totalImports = computed(() => this.allData().paginationDTO.totalElements ?? 0);
  totalUnits = computed(() => this.allHistory().reduce((s, h) => s + h.importUnit, 0));
  totalValue = computed(() =>
    this.allHistory().reduce((s, h) => s + h.importUnit * h.pricePerUnit, 0),
  );
  // Pagination helpers
  totalPages = computed(() => this.pagination().totalPage ?? 0);

  pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: (number | '...')[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
      return pages;
    }

    pages.push(1);
    if (current > 3) pages.push('...');
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i);
    }
    if (current < total - 2) pages.push('...');
    pages.push(total);
    return pages;
  });

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) return;
    this.currentPage.set(page);
    this.refresh$.next({ page, size: this.pageSize() });
  }

  changePageSize(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.refresh$.next({ page: 1, size });
  }

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
  clamp(a: number, b: number): number {
    return Math.min(a, b);
  }
  getTotal(h: ImportHistoryType): number {
    return h.importUnit * h.pricePerUnit;
  }
}

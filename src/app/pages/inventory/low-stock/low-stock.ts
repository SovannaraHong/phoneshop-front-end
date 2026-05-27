import { Component, computed, inject, signal } from '@angular/core';
import { ProductStatsService } from '../../../shared/utils/product-shared/product-stats-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { sign } from 'chart.js/helpers';
import { toSignal } from '@angular/core/rxjs-interop';
import { BrandService } from '../../../core/services/brand/brand-service';
import { BehaviorSubject, switchMap } from 'rxjs';
import { BrandType } from '../../../core/models/brand.model';

@Component({
  selector: 'app-low-stock',
  imports: [CommonModule, FormsModule],
  templateUrl: './low-stock.html',
  styleUrl: './low-stock.css',
})
export class LowStock {
  private statsService = inject(ProductStatsService);
  private brandService = inject(BrandService);

  selectBrandId = signal<number | ''>('');
  Query = signal('');
  selectType = signal('');

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
}

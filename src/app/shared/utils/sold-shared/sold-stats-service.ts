import { computed, inject, Injectable, signal } from '@angular/core';
import { ProductService } from '../../../core/services/product/product-service';
import { ProductType } from '../../../core/models/product.model';
import { switchMap } from 'rxjs';
import { ReportService } from '../../../core/services/report/report-service';
import { ReportProduct } from '../../../pages/reports/reports';

@Injectable({
  providedIn: 'root',
})
export class SoldStatsService {
  private saleService = inject(ReportService);
  private _productSold = signal<ReportProduct[]>([]);

  totalSoldProduct = computed(() =>
    this._productSold().reduce((total, pro) => total + pro.productUnit, 0),
  );
  totalRevenue = computed(() =>
    this._productSold().reduce(
      (total, product) => total + product.totalAmount * product.productUnit,
      0,
    ),
  );
  loadProduct() {
    this.saleService.getTotalSold().subscribe({
      next: (product) => this._productSold.set(product),
    });
  }
}

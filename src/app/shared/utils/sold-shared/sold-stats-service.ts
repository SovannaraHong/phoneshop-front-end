import { inject, Injectable } from '@angular/core';
import { ProductService } from '../../../core/services/product/product-service';

@Injectable({
  providedIn: 'root',
})
export class SoldStatsService {
  private saleService = inject(ProductService);
}

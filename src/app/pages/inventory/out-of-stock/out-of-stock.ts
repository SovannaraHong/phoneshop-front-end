import { Component, computed, inject } from '@angular/core';
import { ProductStatsService } from '../../../shared/utils/product-shared/product-stats-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-out-of-stock',
  imports: [CommonModule, FormsModule],
  templateUrl: './out-of-stock.html',
  styleUrl: './out-of-stock.css',
})
export class OutOfStock {
  private statsService = inject(ProductStatsService);

  products = computed(() => this.statsService.getOutOfStock());
}

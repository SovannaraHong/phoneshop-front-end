import { Component, inject, input } from '@angular/core';
import { BrandType } from '../../../core/models/brand.model';
import { ProductFilterService } from '../../../core/services/product-filter/product-filter-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-shared-filter-bar',
  imports: [CommonModule, FormsModule],
  templateUrl: './shared-filter-bar.html',
  styleUrl: './shared-filter-bar.css',
})
export class SharedFilterBar {
  filter = inject(ProductFilterService);
  brandList = input<BrandType[]>([]);
  typeOptions = input<string[]>([]);
}

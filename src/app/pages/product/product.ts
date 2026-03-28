// product.ts
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ProductService } from '../../core/services/product/product-service';
import { BehaviorSubject, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProductType } from '../../core/models/product.model';
import { BrandService } from '../../core/services/brand/brand-service';
import { BrandType } from '../../core/models/brand.model';
import { ProductForm } from '../../content/product-form/product-form';
import { ColorService } from '../../core/services/color/color-service';

// ─── Models ────────────────────────────────────────────────────────────────

export interface ColorType {
  id: number;
  name: string;
  hex: string;
}

// ─── Component ─────────────────────────────────────────────────────────────

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductForm],
  templateUrl: './product.html',
  styleUrls: ['./product.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Product implements OnInit {
  colors: ColorType[] = [
    { id: 1, name: 'black', hex: '#1a1a1a' },
    { id: 2, name: 'white', hex: '#f5f5f5' },
    { id: 3, name: 'silver', hex: '#c0c0c0' },
    { id: 4, name: 'gold', hex: '#d4af37' },
    { id: 5, name: 'blue', hex: '#3b82f6' },
    { id: 6, name: 'purple', hex: '#a855f7' },
    { id: 7, name: 'green', hex: '#22c55e' },
    { id: 8, name: 'red', hex: '#ef4444' },
    { id: 9, name: 'pink', hex: '#ec4899' },
    { id: 10, name: 'orange', hex: '#f97316' },
    { id: 11, name: 'titanium', hex: '#8a8a8a' },
    { id: 12, name: 'graphite', hex: '#4b4b4b' },
  ];
  // inject
  private productService = inject(ProductService);
  private brandService = inject(BrandService);
  private colorService = inject(ColorService);

  isOpenForm = signal(false);
  isSelectedProduct = signal<ProductType | null>(null);

  //refresh
  private refresh$ = new BehaviorSubject<void>(undefined);

  // compute
  totalProduct = computed(() => this.productList().length);
  activePro = computed(() => this.productList().filter((p) => p.active == true).length);
  bestSeller = computed(
    () => this.productList().filter((p) => p.typeSell === 'Best Seller').length,
  );
  lowStock = computed(() => this.productList().filter((p) => p.unit < 10 && p.active).length);
  //fetch product
  productList = toSignal(this.refresh$.pipe(switchMap(() => this.productService.getProducts())), {
    initialValue: [] as ProductType[],
  });
  brandList = toSignal(this.refresh$.pipe(switchMap(() => this.brandService.getBrands())), {
    initialValue: [] as BrandType[],
  });
  colorList = toSignal(this.refresh$.pipe(switchMap(() => this.colorService.getColor())), {
    initialValue: [] as ColorType[],
  });

  openCreateForm() {
    this.isOpenForm.set(true);
    this.isSelectedProduct.set(null);
  }
  toggleForm() {
    this.isOpenForm.set(!this.isOpenForm());
    if (!this.isOpenForm()) {
      this.isSelectedProduct.set(null);
    }
  }

  //get
  getColorHex(colorName: string) {
    const colorHex = this.colorList().find((b) => b.name === colorName);
    return colorHex ? colorHex.name : ' #000';
  }
  getBrand(brandId: number) {
    const brand = this.brandList().find((b) => b.id === brandId);
    return brand ? brand.name : 'Unknown';
  }

  ngOnInit(): void {}
}

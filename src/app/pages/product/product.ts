import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

import { ProductService } from '../../core/services/product/product-service';
import { BrandService } from '../../core/services/brand/brand-service';
import { ColorService } from '../../core/services/color/color-service';
import { ProductType } from '../../core/models/product.model';
import { BrandType } from '../../core/models/brand.model';
import { ColorType } from '../../core/models/color.model';
import { ProductForm } from '../../content/product-form/product-form';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductForm],
  templateUrl: './product.html',
  styleUrls: ['./product.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Product {
  private productService = inject(ProductService);
  private brandService = inject(BrandService);
  private colorService = inject(ColorService);

  // ── UI state ──────────────────────────────────────────────────────────────
  isOpenForm = signal(false);
  selectedProduct = signal<ProductType | null>(null);

  // ── Search / filter state ─────────────────────────────────────────────────
  searchQuery = signal('');
  selectedBrandId = signal<number | ''>('');
  selectedTypeSell = signal('');

  // ── Data refresh trigger ──────────────────────────────────────────────────
  private refresh$ = new BehaviorSubject<void>(undefined);

  // ── Remote data ───────────────────────────────────────────────────────────
  productList = toSignal(this.refresh$.pipe(switchMap(() => this.productService.getProducts())), {
    initialValue: [] as ProductType[],
  });

  brandList = toSignal(this.refresh$.pipe(switchMap(() => this.brandService.getBrands())), {
    initialValue: [] as BrandType[],
  });

  colorList = toSignal(this.refresh$.pipe(switchMap(() => this.colorService.getColor())), {
    initialValue: [] as ColorType[],
  });

  // ── Computed stats ────────────────────────────────────────────────────────
  totalProduct = computed(() => this.productList().length);
  activePro = computed(() => this.productList().filter((p) => p.active).length);
  bestSeller = computed(
    () => this.productList().filter((p) => p.typeSell === 'Best Seller').length,
  );
  lowStock = computed(() => this.productList().filter((p) => p.unit < 10 && p.active).length);

  // ── Filtered list (search + brand + type) ────────────────────────────────
  filteredProducts = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const brandId = this.selectedBrandId();
    const type = this.selectedTypeSell();

    return this.productList().filter((p) => {
      const matchesSearch = !query || p.name.toLowerCase().includes(query);
      const matchesBrand = !brandId || p.brandId === Number(brandId);
      const matchesType = !type || p.typeSell === type;
      return matchesSearch && matchesBrand && matchesType;
    });
  });

  // ── Unique type-sell values for the filter dropdown ───────────────────────
  typeSellOptions = computed(() => [...new Set(this.productList().map((p) => p.typeSell))].sort());

  // ── Drawer helpers ────────────────────────────────────────────────────────
  openCreateForm(): void {
    this.selectedProduct.set(null);
    this.isOpenForm.set(true);
  }

  openEditForm(product: ProductType): void {
    this.selectedProduct.set(product);
    this.isOpenForm.set(true);
  }

  closeForm(): void {
    this.isOpenForm.set(false);
    this.selectedProduct.set(null);
  }

  onFormSaved(): void {
    this.refresh$.next(); // re-fetch the list
    this.closeForm();
  }

  // ── Lookup helpers ────────────────────────────────────────────────────────
  getBrandName(brandId: number): string {
    return this.brandList().find((b) => b.id === brandId)?.name ?? 'Unknown';
  }
  getModelName(modelId: number): string {
    return this.brandList().find((b) => b.id === modelId)?.name ?? 'Unknown';
  }

  getColorHex(colorId: number): string {
    return this.colorList().find((c) => c.id === colorId)?.hex ?? '#000';
  }

  getColorName(colorId: number): string {
    return this.colorList().find((c) => c.id === colorId)?.name ?? '—';
  }
}

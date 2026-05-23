import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { BrandService } from '../../core/services/brand/brand-service';
import { BehaviorSubject, combineLatest, map, Observable, switchMap } from 'rxjs';
import { BrandType } from '../../core/models/brand.model';
import { CommonModule } from '@angular/common';
import { ProductType } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product/product-service';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart/cart-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductList {
  readonly productService = inject(ProductService);
  readonly cart = inject(CartService);

  //variables data
  selectedTypeSell = signal('');
  // ── Refresh trigger ────────────────────────────────────────────────────────
  private readonly refresh$ = new BehaviorSubject<void>(undefined);

  // ── Raw product list ───────────────────────────────────────────────────────
  readonly productList = toSignal(
    this.refresh$.pipe(switchMap(() => this.productService.getProducts())),
    { initialValue: [] as ProductType[] },
  );

  // ── Brand filter ───────────────────────────────────────────────────────────
  selectedBrand = signal<BrandType | null>(null);

  readonly brandList = computed(() => {
    const seen = new Map<number, BrandType>();
    for (const p of this.productList()) {
      // ✅ guard: skip if brand is missing (e.g. API inconsistency)
      if (p.brand && !seen.has(p.brand.id)) {
        seen.set(p.brand.id, p.brand);
      }
    }
    return [...seen.values()];
  });

  selectedType = signal<string | null>(null);
  readonly typeSellOption = computed(() =>
    [...new Set(this.productList().map((p) => p.typeSell))].sort(),
  );

  readonly filteredProducts = computed(() => {
    const brand = this.selectedBrand();
    const type = this.selectedType();
    if (!type || type === 'All') return this.productList();
    return this.productList().filter((p) => {
      const matchBrand = !brand || p.brand?.id === brand.id;
      const matchType = !type || p.typeSell === type;
      return matchBrand && matchType;
    });
  });

  // ── Actions ────────────────────────────────────────────────────────────────
  setActive(brand: BrandType) {
    this.selectedBrand.set(brand);
  }

  showAll() {
    this.selectedBrand.set(null);
    this.selectedType.set(null); // ✅ reset type too when "All" is clicked
  }

  refresh() {
    this.refresh$.next();
  }
}

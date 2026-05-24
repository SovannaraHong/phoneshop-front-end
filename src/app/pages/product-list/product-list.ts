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
  readonly brandService = inject(BrandService);

  //variables data
  selectedTypeSell = signal('');
  selectedBrandId = signal<number | ''>('');
  searchQuery = signal('');
  // ── Refresh trigger ────────────────────────────────────────────────────────
  private readonly refresh$ = new BehaviorSubject<void>(undefined);

  // ── Raw product list ───────────────────────────────────────────────────────
  readonly productList = toSignal(
    this.refresh$.pipe(switchMap(() => this.productService.getProducts())),
    { initialValue: [] as ProductType[] },
  );
  readonly brandListData = toSignal(
    this.refresh$.pipe(switchMap(() => this.brandService.getBrands())),
    { initialValue: [] as BrandType[] },
  );

  selectedType = signal<string | null>(null);
  readonly typeSellOption = computed(() =>
    [...new Set(this.productList().map((p) => p.typeSell))].sort(),
  );

  readonly filteredProducts = computed(() => {
    const type = this.selectedType();
    const brandId = this.selectedBrandId();
    const query = this.searchQuery().toLowerCase().trim();

    return this.productList().filter((p) => {
      if (!p.active) return false;
      const matchQuery = !query || p.name.toLowerCase().includes(query);
      const matchType = !type || type === 'All' || p.typeSell === type;
      const matchBrandId = !brandId || p.brandId === brandId;
      return matchType && matchBrandId && matchQuery;
    });
  });
  refresh() {
    this.refresh$.next();
  }
}

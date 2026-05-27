import { Component, computed, inject, signal } from '@angular/core';
import { CartService } from '../../core/services/cart/cart-service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductService } from '../../core/services/product/product-service';
import { BehaviorSubject, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProductType } from '../../core/models/product.model';
import { BrandType } from '../../core/models/brand.model';
import { BrandService } from '../../core/services/brand/brand-service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout {
  cart = inject(CartService);
  private productService = inject(ProductService);
  private brandService = inject(BrandService);
  public router = inject(Router);

  //variables data
  selectedTypeSell = signal('');
  selectedBrandId = signal<number | ''>('');
  searchQuery = signal('');
  showMessage = signal(false);
  triggerAdd = signal<number[]>([]);
  // ── Refresh trigger ────────────────────────────────────────────────────────
  private readonly refresh$ = new BehaviorSubject<void>(undefined);

  // ── Raw product list ───────────────────────────────────────────────────────
  shipping = 3.99;
  taxRate = 0.1;

  tax = computed(() => this.cart.subtotal() * this.taxRate);
  total = computed(() => this.cart.subtotal() + this.shipping + this.tax());

  isPlacing = signal(false);
  errorMsg = signal('');
  showSuccess = signal(false);

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

  placeOrder() {
    if (this.cart.cartItems().length === 0) return;

    const saleDTO = {
      product: this.cart.cartItems().map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
    };

    this.isPlacing.set(true);
    this.errorMsg.set('');

    this.productService.createSale(saleDTO).subscribe({
      next: () => {
        this.cart.clear();
        this.isPlacing.set(false);
        this.showSuccess.set(true); // ← show modal instead of navigate
      },
      error: (err) => {
        let message = 'Failed to place order. Please try again.';

        if (err?.error?.message) {
          message = err.error.message;
        } else if (typeof err?.error === 'string') {
          try {
            const parsed = JSON.parse(err.error);
            message = parsed.message || message;
          } catch {
            message = err.error;
          }
        }

        this.errorMsg.set(message);
        this.isPlacing.set(false);
      },
    });
  }

  goShopping() {
    // ← add this
    this.showSuccess.set(false);
    this.router.navigate(['/productList']);
  }

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
  activeAdd(pro: ProductType) {
    this.cart.addToCart(pro);
    this.showMessage.set(true);
    this.triggerAdd.update((ids) => [...ids, pro.id]);

    setTimeout(() => {
      this.showMessage.set(false);
      this.triggerAdd.update((ids) => ids.filter((id) => id !== pro.id));
    }, 3000);
  }
}

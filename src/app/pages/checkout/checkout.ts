import { Component, computed, inject, signal } from '@angular/core';
import { CartService } from '../../core/services/cart/cart-service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductService } from '../../core/services/product/product-service';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout {
  cart = inject(CartService);
  private productService = inject(ProductService);
  public router = inject(Router); // ← change private to public

  shipping = 3.99;
  taxRate = 0.1;

  tax = computed(() => this.cart.subtotal() * this.taxRate);
  total = computed(() => this.cart.subtotal() + this.shipping + this.tax());

  isPlacing = signal(false);
  errorMsg = signal('');
  showSuccess = signal(false); // ← add this

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
}

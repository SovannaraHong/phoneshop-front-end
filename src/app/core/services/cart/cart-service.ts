import { computed, effect, Injectable, signal } from '@angular/core';
import { CartItem } from '../../models/cart.model';
import { ProductType } from '../../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private items = signal<CartItem[]>(this.loadFromStorage());
  selectAddId = signal<number | ''>('');

  cartItems = this.items.asReadonly();
  count = computed(() => this.items().reduce((sum, i) => sum + i.quantity, 0));
  subtotal = computed(() =>
    this.items().reduce((sum, i) => sum + i.product.salePrice * i.quantity, 0),
  );

  constructor() {
    // Auto-save to localStorage whenever cart changes
    effect(() => {
      localStorage.setItem('cart', JSON.stringify(this.items()));
    });
  }

  private loadFromStorage(): CartItem[] {
    try {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  addToCart(product: ProductType) {
    this.items.update((current) => {
      const existing = current.find((i) => i.product.id === product.id);
      if (existing) {
        return current.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...current, { product, quantity: 1 }];
    });
  }

  increment(productId: number) {
    this.items.update((current) =>
      current.map((i) => (i.product.id === productId ? { ...i, quantity: i.quantity + 1 } : i)),
    );
  }

  decrement(productId: number) {
    this.items.update((current) =>
      current
        .map((i) => (i.product.id === productId ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0),
    );
  }

  remove(productId: number) {
    this.items.update((current) => current.filter((i) => i.product.id !== productId));
  }

  clear() {
    this.items.set([]);
    localStorage.removeItem('cart');
  }
}

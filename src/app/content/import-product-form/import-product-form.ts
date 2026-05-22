import { Component, computed, inject, input, output, signal } from '@angular/core';
import { ProductType } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product/product-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-import-product-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './import-product-form.html',
  styleUrl: './import-product-form.css',
})
export class ImportProductForm {
  private productService = inject(ProductService);

  // ── Inputs / Outputs ───────────────────────────────────────────────────────
  /** Pass the full product list in — or let the component fetch it itself */
  products = input<ProductType[]>([]);

  saved = output<void>();
  cancelled = output<void>();

  // ── Local product list (used when @input is empty) ─────────────────────────
  private _localProducts = signal<ProductType[]>([]);

  allProducts = computed(() => {
    const fromInput = this.products();
    return fromInput.length ? fromInput : this._localProducts();
  });

  // ── Color map (matches your existing component) ────────────────────────────
  private colorMap: Record<string, string> = {
    red: '#FF0000',
    green: '#00FF00',
    blue: '#0000FF',
    yellow: '#FFFF00',
    cyan: '#00FFFF',
    magenta: '#FF00FF',
    black: '#000000',
    white: '#FFFFFF',
    gold: '#FFD700',
  };

  // ── Form state ─────────────────────────────────────────────────────────────
  productSearch = signal('');
  selectedProduct = signal<ProductType | null>(null);
  importUnit = signal(0);
  pricePerUnit = signal(0);
  importDate = signal(this.nowDateTimeLocal());

  showDropdown = signal(false);

  // ── UI state ───────────────────────────────────────────────────────────────
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // ── Computed ───────────────────────────────────────────────────────────────
  filteredProducts = computed(() => {
    const q = this.productSearch().toLowerCase().trim();
    if (!q) return this.allProducts();
    return this.allProducts().filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.modelName?.toLowerCase().includes(q) ||
        p.colorName?.toLowerCase().includes(q),
    );
  });

  totalCost = computed(() => this.importUnit() * this.pricePerUnit());

  isFormValid = computed(
    () =>
      !!this.selectedProduct() &&
      this.importUnit() > 0 &&
      this.pricePerUnit() > 0 &&
      !!this.importDate(),
  );

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit(): void {
    // If no products passed via @Input, fetch them
    if (!this.products().length) {
      this.productService.getProducts().subscribe({
        next: (list) => this._localProducts.set(list),
        error: () => {}, // silently fail — parent should handle
      });
    }

    // Close dropdown on outside click
    document.addEventListener('click', this.onDocClick);
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.onDocClick);
  }

  private onDocClick = () => {
    this.showDropdown.set(false);
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  getColorHex(colorName: string): string {
    if (!colorName) return '#000';
    return this.colorMap[colorName.toLowerCase()] ?? '#9ca3af';
  }

  selectProduct(p: ProductType): void {
    this.selectedProduct.set(p);
    this.productSearch.set(p.name);
    this.showDropdown.set(false);
    this.errorMessage.set(null);
  }

  clearProduct(): void {
    this.selectedProduct.set(null);
    this.productSearch.set('');
    this.importUnit.set(0);
    this.pricePerUnit.set(0);
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  private nowDateTimeLocal(): string {
    const now = new Date();
    // Format: YYYY-MM-DDTHH:mm  (required by datetime-local input)
    const pad = (n: number) => n.toString().padStart(2, '0');
    return (
      `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}` +
      `T${pad(now.getHours())}:${pad(now.getMinutes())}`
    );
  }

  /** Convert datetime-local value to the backend format: "YYYY-MM-DD HH:mm:ss" */
  private toBackendDate(value: string): string {
    // value is "YYYY-MM-DDTHH:mm"
    return value.replace('T', ' ') + ':00';
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  onSubmit(): void {
    if (!this.isFormValid() || this.isSubmitting()) return;

    const product = this.selectedProduct()!;
    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const payload = {
      productId: product.id,
      importUnit: this.importUnit(),
      pricePerUnit: this.pricePerUnit(),
      importDate: this.toBackendDate(this.importDate()),
    };

    this.productService.importProduct(payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.successMessage.set(
          `Successfully imported ${this.importUnit()} units of "${product.name}".`,
        );
        // Give user a moment to read the success message then emit
        setTimeout(() => {
          this.saved.emit();
          this.resetForm();
        }, 1200);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message ?? 'Import failed. Please try again.');
      },
    });
  }

  onCancel(): void {
    this.resetForm();
    this.cancelled.emit();
  }

  private resetForm(): void {
    this.selectedProduct.set(null);
    this.productSearch.set('');
    this.importUnit.set(0);
    this.pricePerUnit.set(0);
    this.importDate.set(this.nowDateTimeLocal());
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }
}

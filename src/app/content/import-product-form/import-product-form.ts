import {
  Component,
  computed,
  EventEmitter,
  inject,
  Input,
  input,
  OnInit,
  OnDestroy,
  Output,
  output,
  signal,
} from '@angular/core';
import { ProductType } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product/product-service';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { nowDateTimeLocal } from '../../common/FormImport.validate';
import { BehaviorSubject, combineLatest, Subscription, take } from 'rxjs';
import { BrandType } from '../../core/models/brand.model';
import { ModelService } from '../../core/services/model/model-service';
import { ColorService } from '../../core/services/color/color-service';
import { ProductStatsService } from '../../shared/utils/product-shared/product-stats-service';

export type FormMode = 'create' | 'edit';

@Component({
  selector: 'app-import-product-form',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './import-product-form.html',
  styleUrl: './import-product-form.css',
  standalone: true,
})
export class ImportProductForm implements OnInit, OnDestroy {
  private productService = inject(ProductService);
  private fb = inject(FormBuilder);
  private statsService = inject(ProductStatsService);
  private statusSub?: Subscription;
  private valuesSub?: Subscription;
  brands: BrandType[] = [];

  // ── Inputs / Outputs ───────────────────────────────────────────────────────
  products = input<ProductType[]>([]);
  @Output() saveData = new EventEmitter<void>();
  @Input() importForm: ProductType | null = null;

  saved = output<void>();
  cancelled = output<void>();
  mode = signal<FormMode>('create');
  private refresh$ = new BehaviorSubject<void>(undefined);
  // ── Local product list ─────────────────────────────────────────────────────
  private _localProducts = signal<ProductType[]>([]);

  allProducts = computed(() => {
    const fromInput = this.products();
    return fromInput.length ? fromInput : this._localProducts();
  });

  // ── Color map ──────────────────────────────────────────────────────────────
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

  // ── Reactive Form ──────────────────────────────────────────────────────────
  form!: FormGroup;

  // ── UI state ───────────────────────────────────────────────────────────────
  productSearch = signal('');
  selectedProduct = signal<ProductType | null>(null);
  showDropdown = signal(false);
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Bridge Angular form state into signals so computed() can react
  private formValid = signal(false);
  formValues = signal<{
    importUnit: number | null;
    pricePerUnit: number | null;
    importDate: string;
  }>({
    importUnit: null,
    pricePerUnit: null,
    importDate: nowDateTimeLocal(),
  });

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

  totalCost = computed(
    () => (this.formValues().importUnit ?? 0) * (this.formValues().pricePerUnit ?? 0),
  );

  isFormValid = computed(() => !!this.selectedProduct() && this.formValid());

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit(): void {
    console.log(this.selectedProduct()?.brandId);
    this.form = this.fb.group({
      importUnit: [null, [Validators.required, Validators.min(1)]],
      pricePerUnit: [null, [Validators.required, Validators.min(0.01)]],
      importDate: [nowDateTimeLocal(), Validators.required],
    });
    if (this.importForm) {
      this.selectedProduct.set(this.importForm);
      this.productSearch.set(this.importForm.name);
      this.refresh$.next();
    } else if (!this.products().length) {
      this.productService.getProducts().subscribe({
        next: (list) => this._localProducts.set(list),
        error: () => {},
      });
    }
    this.formValid.set(this.form.valid);
    this.formValues.set(this.form.value);

    this.statusSub = this.form.statusChanges.subscribe((status) => {
      this.formValid.set(status === 'VALID');
    });

    this.valuesSub = this.form.valueChanges.subscribe((v) => {
      this.formValues.set(v);
    });

    if (!this.products().length) {
      this.productService.getProducts().subscribe({
        next: (list) => this._localProducts.set(list),
        error: () => {},
      });
    }
  }

  ngOnDestroy(): void {
    this.statusSub?.unsubscribe();
    this.valuesSub?.unsubscribe();
  }

  closeDropdown(): void {
    setTimeout(() => this.showDropdown.set(false), 300);
  }

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
    this.form.reset({
      importUnit: null,
      pricePerUnit: null,
      importDate: nowDateTimeLocal(),
    });
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  private toBackendDate(value: string): string {
    return value.replace('T', ' ') + ':00';
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  onSubmit(): void {
    if (!this.isFormValid() || this.isSubmitting()) return;

    const product = this.selectedProduct()!;
    const { importUnit, pricePerUnit, importDate } = this.form.value;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const payload = {
      productId: product.id,
      importUnit,
      pricePerUnit,
      importDate: this.toBackendDate(importDate),
    };

    this.productService.importProduct(payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.saveData.emit();
        this.successMessage.set(`Successfully imported ${importUnit} units of "${product.name}".`);
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
    this.form.reset({
      importUnit: null,
      pricePerUnit: null,
      importDate: nowDateTimeLocal(),
    });
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }
  getBrandName(id: number): string {
    return this.brands?.find((b) => b.id === id)?.name || '';
  }
}

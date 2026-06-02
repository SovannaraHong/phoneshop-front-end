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
  ChangeDetectionStrategy,
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
import { BehaviorSubject, combineLatest, Subscription, switchMap, take } from 'rxjs';
import { BrandType } from '../../core/models/brand.model';

export type FormMode = 'create' | 'edit';

@Component({
  selector: 'app-import-product-form',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './import-product-form.html',
  styleUrl: './import-product-form.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportProductForm implements OnInit, OnDestroy {
  private productService = inject(ProductService);
  private fb = inject(FormBuilder);
  private statusSub?: Subscription;
  private valuesSub?: Subscription;
  brands: BrandType[] = [];

  // ── Inputs / Outputs ───────────────────────────────────────────────────────
  products = input<ProductType[]>([]);
  @Input() import: ProductType | null = null;

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
  conditionOptions = signal([
    { value: 'new', label: 'New', desc: 'Sealed / unused' },
    { value: 'second_hand', label: 'Second Hand', desc: 'Lightly used' },
    { value: 'used', label: 'Used', desc: 'Visibly worn' },
  ]);
  form!: FormGroup;

  productSearch = signal('');
  selectedProduct = signal<ProductType | null>(null);
  showDropdown = signal(false);
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

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
      condition: [null, Validators.required],
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
  private toBackendCondition(value: string): string {
    const map: Record<string, string> = {
      new: 'NEW',
      second_hand: 'SECOND HAND',
      used: 'USED',
    };
    return map[value] ?? value.toUpperCase();
  }
  // ── Actions ────────────────────────────────────────────────────────────────
  onSubmit(): void {
    if (!this.isFormValid() || this.isSubmitting()) return;

    const product = this.selectedProduct()!;
    const { importUnit, pricePerUnit, importDate, condition } = this.form.value;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const payload = {
      productId: product.id,
      importUnit,
      pricePerUnit,
      importDate: this.toBackendDate(importDate),
      conditionType: this.toBackendCondition(condition),
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
      conditionType: null,
    });
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }
  getBrandName(id: number): string {
    return this.brands?.find((b) => b.id === id)?.name || '';
  }
}

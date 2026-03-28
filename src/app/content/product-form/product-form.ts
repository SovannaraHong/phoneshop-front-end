import { ChangeDetectionStrategy, Component, inject, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, switchMap, finalize, of } from 'rxjs';

import { ColorType } from '../../core/models/color.model';
import { BrandType } from '../../core/models/brand.model';
import { ModelType } from '../../core/models/model.model';
import { ProductType, type } from '../../core/models/product.model';

import { BrandService } from '../../core/services/brand/brand-service';
import { ColorService } from '../../core/services/color/color-service';
import { ModelService } from '../../core/services/model/model-service';
import { ProductService } from '../../core/services/product/product-service';

/** Format a JS Date → "YYYY-MM-DD HH:mm:ss" as required by the backend */
function toImportDateString(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}

export type FormMode = 'create' | 'edit';

@Component({
  selector: 'app-product-form',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductForm implements OnInit {
  /** Pass a product to switch the form into edit mode */
  @Input() editProduct: ProductType | null = null;

  private brandService = inject(BrandService);
  private colorService = inject(ColorService);
  private modelService = inject(ModelService);
  private productService = inject(ProductService);
  private fb = inject(FormBuilder);

  productForm!: FormGroup;

  // ── Signals ────────────────────────────────────────────────────────────────
  mode = signal<FormMode>('create');
  selectedColor = signal<string | null>(null);
  selectedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);
  isLoading = signal(false);
  submitSuccess = signal(false);
  submitError = signal<string | null>(null);
  showDeleteConfirm = signal(false);

  // ── Static data ────────────────────────────────────────────────────────────
  types: type[] = [
    { id: 1, name: 'Best Seller' },
    { id: 2, name: 'Top Rated' },
    { id: 3, name: 'Trending' },
    { id: 4, name: 'Popular' },
    { id: 5, name: 'Premium' },
  ];

  // ── Reactive lists ─────────────────────────────────────────────────────────
  private refresh$ = new BehaviorSubject<void>(undefined);

  brandList = toSignal(this.refresh$.pipe(switchMap(() => this.brandService.getBrands())), {
    initialValue: [] as BrandType[],
  });
  colorList = toSignal(this.refresh$.pipe(switchMap(() => this.colorService.getColor())), {
    initialValue: [] as ColorType[],
  });
  modelList = toSignal(this.refresh$.pipe(switchMap(() => this.modelService.getModel())), {
    initialValue: [] as ModelType[],
  });

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.productForm = this.fb.group({
      model: ['', Validators.required],
      color: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      unit: ['', [Validators.required, Validators.min(1)]],
      type: ['', Validators.required],
      des: [''],
      status: [true],
    });

    if (this.editProduct) {
      this.mode.set('edit');
      this.populateForm(this.editProduct);
    }
  }

  // ── Populate form for edit ─────────────────────────────────────────────────
  private populateForm(product: ProductType): void {
    // Find the color name by colorId so the swatch highlights correctly
    const color = this.colorList().find((c) => c.id === product.colorId);
    this.productForm.patchValue({
      model: product.modelId,
      color: color?.name ?? '',
      price: product.salePrice,
      unit: product.unit,
      type: product.typeSell,
      des: product.description,
      status: product.active,
    });
    if (color) this.selectedColor.set(color.hex);
    if (product.imagePreview) this.previewUrl.set(product.imagePreview);
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    if (this.mode() === 'create' && !this.selectedFile()) {
      this.submitError.set('Please upload a product image before submitting.');
      return;
    }

    this.mode() === 'create' ? this.handleCreate() : this.handleUpdate();
  }

  // ── Create — 4 API calls chained ──────────────────────────────────────────
  private handleCreate(): void {
    this.isLoading.set(true);
    this.submitError.set(null);
    this.submitSuccess.set(false);

    const form = this.productForm.value;

    const productPayload: Partial<ProductType> = {
      modelId: Number(form.model),
      colorId: this.getColorId(form.color) ?? undefined,
      salePrice: Number(form.price),
      unit: Number(form.unit),
      typeSell: form.type,
      description: form.des,
      active: form.status,
    };

    // 1️⃣ createProduct → returns created product with its new id
    this.productService
      .createProduct(productPayload)
      .pipe(
        switchMap((created: any) => {
          const id: number = created?.id ?? created?.[0]?.id;

          // 2️⃣ setPrice — plain-text response
          return this.productService.createSell(id, Number(form.price)).pipe(
            switchMap(() =>
              // 3️⃣ importProduct — { productId, importUnit, pricePerUnit, importDate }
              this.productService
                .importProduct({
                  productId: id,
                  importUnit: Number(form.unit),
                  pricePerUnit: Number(form.price),
                  importDate: toImportDateString(), // ← fixes the 400 error
                })
                .pipe(
                  switchMap(() =>
                    // 4️⃣ importImage — multipart/form-data
                    this.productService.importImage(id, this.selectedFile()!),
                  ),
                ),
            ),
          );
        }),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: () => {
          this.submitSuccess.set(true);
          this.finish();
        },
        error: (err) => {
          console.error('Product creation failed:', err);
          this.submitError.set(this.extractErrorMessage(err));
        },
      });
  }

  // ── Update ────────────────────────────────────────────────────────────────
  private handleUpdate(): void {
    if (!this.editProduct) return;

    this.isLoading.set(true);
    this.submitError.set(null);
    this.submitSuccess.set(false);

    const form = this.productForm.value;
    const id = this.editProduct.id;

    const productPayload: Partial<ProductType> = {
      modelId: Number(form.model),
      colorId: this.getColorId(form.color) ?? undefined,
      salePrice: Number(form.price),
      unit: Number(form.unit),
      typeSell: form.type,
      description: form.des,
      active: form.status,
    };

    // Update product details, then optionally update price & image
    this.productService
      .updateProduct(id, productPayload)
      .pipe(
        switchMap(() =>
          // Always update price on edit
          this.productService.createSell(id, Number(form.price)).pipe(
            switchMap(() => {
              // Only upload new image if a new file was selected
              if (this.selectedFile()) {
                return this.productService.importImage(id, this.selectedFile()!);
              }
              return of(null);
            }),
          ),
        ),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: () => {
          this.submitSuccess.set(true);
          // In edit mode, don't reset — just show success banner
        },
        error: (err) => {
          console.error('Product update failed:', err);
          this.submitError.set(this.extractErrorMessage(err));
        },
      });
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  onDeleteRequest(): void {
    this.showDeleteConfirm.set(true);
  }

  onDeleteCancel(): void {
    this.showDeleteConfirm.set(false);
  }

  onDeleteConfirm(): void {
    if (!this.editProduct) return;

    this.isLoading.set(true);
    this.submitError.set(null);
    this.showDeleteConfirm.set(false);

    this.productService
      .deleteProduct(this.editProduct.id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.submitSuccess.set(true);
          // Emit event or navigate away — hook up to parent as needed
        },
        error: (err) => {
          console.error('Product delete failed:', err);
          this.submitError.set(this.extractErrorMessage(err));
        },
      });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private extractErrorMessage(err: any): string {
    // 409 Conflict = duplicate product
    if (err?.status === 409) {
      return 'This product already exists. A product with this model & color is already in the system.';
    }
    // Plain-text body hinting at duplicate
    const bodyText: string =
      typeof err?.error === 'string' ? err.error : (err?.error?.message ?? err?.message ?? '');
    const lower = bodyText.toLowerCase();
    if (
      lower.includes('already exist') ||
      lower.includes('duplicate') ||
      lower.includes('conflict') ||
      lower.includes('unique constraint')
    ) {
      return 'This product already exists. A product with this model & color is already in the system.';
    }
    // Structured validation errors like { importDate: "cannot be null" }
    if (err?.error && typeof err.error === 'object') {
      const messages = Object.values(err.error).join(' | ');
      if (messages) return messages;
    }
    return bodyText || 'Something went wrong. Please try again.';
  }

  getProductName(): string {
    const form = this.productForm?.value;
    const model = this.modelList().find((m) => m.id == form?.model);
    const color = this.colorList().find((c) => c.name === form?.color);
    if (!model || !color) return '';
    return `${model.name} - ${color.name}`;
  }

  onSelectColor(color: ColorType): void {
    this.selectedColor.set(color.hex);
    this.productForm.patchValue({ color: color.name });
  }

  getColorHex(colorName: string): string {
    return this.colorList().find((c) => c.name === colorName)?.hex ?? '#000';
  }

  getColorId(name: string): number | null {
    return this.colorList().find((c) => c.name === name)?.id ?? null;
  }

  getSelectType(name: string): string {
    return this.types.find((t) => t.name === name)?.name ?? 'Unknown';
  }

  onSelectFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input?.files?.length) return;
    const file = input.files[0];
    this.selectedFile.set(file);
    const reader = new FileReader();
    reader.onload = () => this.previewUrl.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  toggleStatus(): void {
    this.productForm.patchValue({ status: !this.productForm.value.status });
  }

  reloadLists(): void {
    this.refresh$.next();
  }

  onReset(): void {
    this.productForm.reset({ status: true });
    this.selectedFile.set(null);
    this.previewUrl.set(null);
    this.selectedColor.set(null);
    this.submitError.set(null);
    this.submitSuccess.set(false);
    this.showDeleteConfirm.set(false);
  }

  private finish(): void {
    this.onReset();
  }
}

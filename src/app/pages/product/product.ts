import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { BehaviorSubject, filter, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

import { ProductService } from '../../core/services/product/product-service';
import { BrandService } from '../../core/services/brand/brand-service';
import { ColorService } from '../../core/services/color/color-service';
import { ProductType } from '../../core/models/product.model';
import { BrandType } from '../../core/models/brand.model';
import { ColorType } from '../../core/models/color.model';
import { ProductForm } from '../../content/product-form/product-form';
import { ImportProductForm } from '../../content/import-product-form/import-product-form';
import { ProductStatsService } from '../../shared/utils/product-shared/product-stats-service';

@Component({
  selector: 'app-product',
  imports: [CommonModule, FormsModule, ProductForm, ImportProductForm, RouterOutlet],
  templateUrl: './product.html',
  styleUrls: ['./product.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Product {
  private productService = inject(ProductService);
  private brandService = inject(BrandService);
  private colorService = inject(ColorService);
  readonly statsService = inject(ProductStatsService);
  private router = inject(Router);

  objectEntries = Object.entries;

  color: ColorType[] = [
    { id: 1, name: 'Red', hex: '#FF0000' },
    { id: 2, name: 'Green', hex: '#00FF00' },
    { id: 3, name: 'Blue', hex: '#0000FF' },
    { id: 4, name: 'Yellow', hex: '#FFFF00' },
    { id: 5, name: 'Cyan', hex: '#00FFFF' },
    { id: 6, name: 'Magenta', hex: '#FF00FF' },
    { id: 7, name: 'Black', hex: '#000000' },
    { id: 8, name: 'White', hex: '#FFFFFF' },
    { id: 9, name: 'gold', hex: '#FFD700' },
  ];

  activeTab = signal<'products' | 'lowStock' | 'outOfStock'>('products');

  isOpenForm = signal(false);
  isOpenFormImport = signal(false);
  selectedProduct = signal<ProductType | null>(null);

  // ── Filter state ─────────────────────────────────────────────────────────────
  searchQuery = signal('');
  selectedBrandId = signal<number | ''>('');
  selectedTypeSell = signal('');

  // ── Delete state ─────────────────────────────────────────────────────────────
  isDelete = signal(false);
  deleteTargetId = signal<number | null>(null);
  errorMessage = signal<string | null>(null);

  // ── Import state ─────────────────────────────────────────────────────────────
  isImporting = signal(false);
  importErrors = signal<Record<number, string> | null>(null);
  importSuccess = signal<string | null>(null);

  // ── Refresh trigger ───────────────────────────────────────────────────────────
  private refresh$ = new BehaviorSubject<void>(undefined);

  // ── Remote data ───────────────────────────────────────────────────────────────
  productList = toSignal(this.refresh$.pipe(switchMap(() => this.productService.getProducts())), {
    initialValue: [] as ProductType[],
  });

  brandList = toSignal(this.refresh$.pipe(switchMap(() => this.brandService.getBrands())), {
    initialValue: [] as BrandType[],
  });

  colorList = toSignal(this.refresh$.pipe(switchMap(() => this.colorService.getColor())), {
    initialValue: [] as ColorType[],
  });

  // ── Computed stats ────────────────────────────────────────────────────────────
  totalProduct = computed(() => this.productList().length);
  activePro = computed(() => this.productList().filter((p) => p.active).length);
  bestSeller = computed(
    () => this.productList().filter((p) => p.typeSell === 'Best Seller').length,
  );
  lowStock = computed(
    () => this.productList().filter((p) => p.unit > 0 && p.unit < 10 && p.active).length,
  );
  outOfStock = computed(() => this.productList().filter((p) => p.unit < 1 && p.active).length);

  // ── Filtered list ─────────────────────────────────────────────────────────────
  filteredProducts = computed(() => {
    const list = this.productList();
    const query = this.searchQuery().toLowerCase().trim();
    const brandId = this.selectedBrandId();
    const type = this.selectedTypeSell();

    return list.filter((p) => {
      const matchesSearch = !query || p.name?.toLowerCase().includes(query);
      const matchesBrand = brandId === '' || p.brandId === Number(brandId);
      const matchesType = !type || p.typeSell === type;
      return matchesSearch && matchesBrand && matchesType;
    });
  });

  typeSellOptions = computed(() => [...new Set(this.productList().map((p) => p.typeSell))].sort());

  constructor() {
    effect(() => {
      this.statsService.setProducts(this.productList());
    });
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((e: any) => {
      const url: string = e.urlAfterRedirects;
      if (url.includes('lowStock')) {
        this.activeTab.set('lowStock');
      } else if (url.includes('OutOfStock') || url.includes('outOfStock')) {
        this.activeTab.set('outOfStock');
      } else {
        this.activeTab.set('products');
      }
    });

    // ✅ Also set on first load (in case user lands directly on child route)
    const url = this.router.url;
    if (url.includes('lowStock')) {
      this.activeTab.set('lowStock');
    } else if (url.includes('OutOfStock') || url.includes('outOfStock')) {
      this.activeTab.set('outOfStock');
    } else {
      this.activeTab.set('products');
    }
  }

  // ── Tab navigation ────────────────────────────────────────────────────────────
  navigateTo(tab: 'products' | 'lowStock' | 'outOfStock'): void {
    this.activeTab.set(tab);
    if (tab === 'lowStock') {
      this.router.navigate(['product', 'lowStock']);
    } else if (tab === 'outOfStock') {
      this.router.navigate(['product', 'outOfStock']);
    } else {
      this.router.navigate(['product']);
    }
  }

  // ── Export report ─────────────────────────────────────────────────────────────
  exportReport(): void {
    const tab = this.activeTab();
    const list =
      tab === 'lowStock'
        ? this.productList().filter((p) => p.unit > 0 && p.unit < 10 && p.active)
        : this.productList().filter((p) => p.unit < 1 && p.active);

    console.log(`Exporting ${tab} report`, list);
    // hook up your real export/download logic here
  }

  // ── Drawer helpers ────────────────────────────────────────────────────────────
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
    this.refresh$.next();
    this.closeForm();
  }

  // ── Import form helpers ───────────────────────────────────────────────────────
  openImportForm(): void {
    this.isOpenFormImport.set(true);
  }

  closeFormImport(): void {
    this.isOpenFormImport.set(false);
  }

  onImportSave(): void {
    this.refresh$.next();
    this.closeFormImport();
  }

  // ── Import from Excel ─────────────────────────────────────────────────────────
  triggerImport(): void {
    this.importErrors.set(null);
    this.importSuccess.set(null);
    const input = document.getElementById('excelFileInput') as HTMLInputElement;
    if (input) {
      input.value = '';
      input.click();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    if (!/\.(xlsx|xls)$/i.test(file.name)) {
      this.importErrors.set({ 0: 'Invalid file. Please upload an .xlsx or .xls file.' });
      return;
    }

    this.isImporting.set(true);
    this.importErrors.set(null);
    this.importSuccess.set(null);

    this.productService.uploadProduct(file).subscribe({
      next: (res) => {
        this.isImporting.set(false);
        if (res.success) {
          this.importSuccess.set(res.message);
          this.refresh$.next();
        } else {
          this.importErrors.set(res.errors ?? null);
        }
      },
      error: (err) => {
        this.isImporting.set(false);
        this.importErrors.set({ 0: err.error?.message ?? 'Import failed. Please try again.' });
      },
    });
  }

  closeImportResult(): void {
    this.importErrors.set(null);
    this.importSuccess.set(null);
  }

  // ── Lookup helpers ────────────────────────────────────────────────────────────
  getBrandName(brandId: number): string {
    return this.brandList().find((b) => b.id === brandId)?.name ?? 'Unknown';
  }

  getColorHex(colorName: string): string {
    if (!colorName) return '#000';
    return this.color.find((c) => c.name.toLowerCase() === colorName.toLowerCase())?.hex ?? '#000';
  }

  getColorName(colorId: number): string {
    return this.colorList().find((c) => c.id === colorId)?.name ?? '—';
  }

  getModelName(modelName: string): string {
    return this.brandList().find((b) => b.name === modelName)?.name ?? 'Unknown';
  }

  // ── Delete helpers ────────────────────────────────────────────────────────────
  confirmDelete(id: number): void {
    this.deleteTargetId.set(id);
    this.isDelete.set(true);
  }

  onCancelDelete(): void {
    this.isDelete.set(false);
    this.deleteTargetId.set(null);
    this.errorMessage.set(null);
  }

  onConfirmDelete(): void {
    const id = this.deleteTargetId();
    if (id === null) return;

    this.productService.deleteProduct(id).subscribe({
      next: () => {
        this.refresh$.next();
        this.isDelete.set(false);
        this.deleteTargetId.set(null);
        this.errorMessage.set(null);
      },
      error: (err) => {
        this.errorMessage.set(
          err.error?.message ?? 'Delete failed. The product could not be deleted.',
        );
      },
    });
  }
}

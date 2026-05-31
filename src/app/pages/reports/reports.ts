import { CommonModule, DecimalPipe } from '@angular/common';
import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  ViewEncapsulation,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { ProductType } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product/product-service';
import { ReportService } from '../../core/services/report/report-service';

export interface ReportProduct {
  productId: number;
  productName: string;
  productUnit: number;
  totalAmount: number;
  soldDate: Date;
}

export interface ExpenseReport {
  productId: number;
  productName: string;
  expenseUnit: number;
  totalAmount: number;
  expenseDate: Date;
}

@Component({
  selector: 'app-reports',
  imports: [CommonModule, DecimalPipe, FormsModule],
  templateUrl: './reports.html',
  styleUrl: './reports.css',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Reports implements OnInit {
  // ── Services ──────────────────────────────────────
  private reportService = inject(ReportService); // ← replaces HttpClient + environment
  private productService = inject(ProductService);

  // ── Tab ──────────────────────────────────────────
  activeTab = signal<'sales' | 'expense'>('sales');

  quickRanges: { label: string; value: 'today' | 'week' | 'month' | 'year' }[] = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'This Year', value: 'year' },
  ];

  // ── Shared state ─────────────────────────────────
  private allProducts = signal<ProductType[]>([]);
  isLoading = signal(false);
  errorMsg = signal('');
  startDate = signal('');
  endDate = signal('');
  reportDate = '';
  private initialized = false;

  // ── Sales ─────────────────────────────────────────
  products = signal<ReportProduct[]>([]);
  searchQuery = signal('');
  selectedProduct = signal('');

  uniqueProducts = computed(() => [...new Set(this.products().map((p) => p.productName))].sort());
  filteredProducts = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const s = this.selectedProduct().toLowerCase();
    return this.products().filter(
      (p) =>
        (!q || p.productName.toLowerCase().includes(q)) &&
        (!s || p.productName.toLowerCase().includes(s)),
    );
  });
  totalUnits = computed(() => this.products().reduce((sum, p) => sum + p.productUnit, 0));
  grandTotal = computed(() => this.products().reduce((sum, p) => sum + p.totalAmount, 0));
  maxAmount = computed(() => Math.max(...this.products().map((p) => p.totalAmount), 1));

  private barColors = [
    'bg-gradient-to-r from-indigo-400 to-violet-400',
    'bg-gradient-to-r from-violet-400 to-purple-400',
    'bg-gradient-to-r from-sky-400 to-indigo-400',
    'bg-gradient-to-r from-emerald-400 to-teal-400',
    'bg-gradient-to-r from-amber-400 to-orange-400',
    'bg-gradient-to-r from-rose-400 to-pink-400',
  ];

  // ── Expense ───────────────────────────────────────
  expenses = signal<ExpenseReport[]>([]);
  expenseSearchQuery = signal('');
  selectedExpenseProduct = signal('');

  uniqueExpenseProducts = computed(() =>
    [...new Set(this.expenses().map((e) => e.productName))].sort(),
  );
  filteredExpenses = computed(() => {
    const q = this.expenseSearchQuery().toLowerCase().trim();
    const s = this.selectedExpenseProduct().toLowerCase();
    return this.expenses().filter(
      (e) =>
        (!q || e.productName.toLowerCase().includes(q)) &&
        (!s || e.productName.toLowerCase().includes(s)),
    );
  });
  totalExpenseUnits = computed(() => this.expenses().reduce((sum, e) => sum + e.expenseUnit, 0));
  grandExpense = computed(() => this.expenses().reduce((sum, e) => sum + e.totalAmount, 0));
  maxExpenseAmount = computed(() => Math.max(...this.expenses().map((e) => e.totalAmount), 1));

  private expenseBarColors = [
    'bg-gradient-to-r from-rose-400 to-pink-400',
    'bg-gradient-to-r from-orange-400 to-amber-400',
    'bg-gradient-to-r from-red-400 to-rose-400',
    'bg-gradient-to-r from-pink-400 to-fuchsia-400',
    'bg-gradient-to-r from-amber-400 to-yellow-400',
    'bg-gradient-to-r from-fuchsia-400 to-purple-400',
  ];

  // ── Lifecycle ─────────────────────────────────────
  ngOnInit(): void {
    this.productService.getProducts().subscribe((data) => this.allProducts.set(data));

    const now = new Date();
    this.startDate.set(this.toDateInput(now));
    this.endDate.set(this.toDateInput(now));
    this.reportDate = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    this.initialized = true;
    this.fetchAll();
  }

  // ── Date handlers ─────────────────────────────────
  onStartDateChange(value: string): void {
    this.startDate.set(value);
    if (this.initialized && this.startDate() && this.endDate()) this.fetchAll();
  }

  onEndDateChange(value: string): void {
    this.endDate.set(value);
    if (this.initialized && this.startDate() && this.endDate()) this.fetchAll();
  }

  setQuick(range: 'today' | 'week' | 'month' | 'year'): void {
    const now = new Date();
    this.endDate.set(this.toDateInput(now));
    if (range === 'today') {
      this.startDate.set(this.toDateInput(now));
    } else if (range === 'week') {
      const first = new Date(now);
      first.setDate(now.getDate() - now.getDay());
      this.startDate.set(this.toDateInput(first));
    } else if (range === 'month') {
      this.startDate.set(this.toDateInput(new Date(now.getFullYear(), now.getMonth(), 1)));
    } else if (range === 'year') {
      this.startDate.set(this.toDateInput(new Date(now.getFullYear(), 0, 1)));
    }
    this.fetchAll();
  }

  private toDateInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // ── Fetch via ReportService ────────────────────────
  private fetchAll(): void {
    if (!this.startDate() || !this.endDate()) return;

    this.isLoading.set(true);
    this.errorMsg.set('');
    this.searchQuery.set('');
    this.selectedProduct.set('');
    this.expenseSearchQuery.set('');
    this.selectedExpenseProduct.set('');

    let done = 0;
    const checkDone = () => {
      if (++done === 2) this.isLoading.set(false);
    };

    // Sales — now via service
    this.reportService
      .getSalesReport(this.startDate(), this.endDate())
      .pipe(finalize(checkDone))
      .subscribe({
        next: (data) => this.products.set(data),
        error: (err) => this.errorMsg.set(err?.error?.message ?? 'Failed to load sales report.'),
      });

    // Expense — now via service
    this.reportService
      .getExpenseReport(this.startDate(), this.endDate())
      .pipe(finalize(checkDone))
      .subscribe({
        next: (data) => this.expenses.set(data),
        error: (err) => this.errorMsg.set(err?.error?.message ?? 'Failed to load expense report.'),
      });
  }

  // ── Helpers ───────────────────────────────────────
  getImage(productId: number): string {
    return this.allProducts().find((p) => p.id === productId)?.imagePath ?? '';
  }

  getBarColor(index: number): string {
    return this.barColors[index % this.barColors.length];
  }

  getExpenseBarColor(index: number): string {
    return this.expenseBarColors[index % this.expenseBarColors.length];
  }
}

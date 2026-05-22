// reports.ts - update the product cards section
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
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environments';
import { finalize } from 'rxjs/operators';

export interface Product {
  productId: number;
  productName: string;
  productUnit: number;
  totalAmount: number;
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
  private http = inject(HttpClient);
  private api = environment.baseUrl;

  // ← Angular 21 signals
  products = signal<Product[]>([]);
  isLoading = signal(false);
  errorMsg = signal('');
  startDate = signal('');
  endDate = signal('');

  // ← computed values auto-update when products changes
  totalUnits = computed(() => this.products().reduce((sum, p) => sum + p.productUnit, 0));
  grandTotal = computed(() => this.products().reduce((sum, p) => sum + p.totalAmount, 0));
  maxUnits = computed(() => Math.max(...this.products().map((p) => p.productUnit), 1));
  maxAmount = computed(() => Math.max(...this.products().map((p) => p.totalAmount), 1));

  reportDate = '';
  private initialized = false;

  private colorMap: Record<string, string> = {
    red: '#ef4444',
    blue: '#3b82f6',
    green: '#22c55e',
    black: '#374151',
    white: '#e5e7eb',
    gold: '#eab308',
    silver: '#94a3b8',
    purple: '#a855f7',
    pink: '#ec4899',
    orange: '#f97316',
    yellow: '#facc15',
    gray: '#9ca3af',
  };

  private accentColors = [
    'bg-gradient-to-r from-indigo-400 to-violet-400',
    'bg-gradient-to-r from-violet-400 to-purple-400',
    'bg-gradient-to-r from-sky-400 to-indigo-400',
    'bg-gradient-to-r from-emerald-400 to-teal-400',
    'bg-gradient-to-r from-amber-400 to-orange-400',
    'bg-gradient-to-r from-rose-400 to-pink-400',
  ];

  private barColors = [
    'bg-gradient-to-r from-indigo-400 to-violet-400',
    'bg-gradient-to-r from-violet-400 to-purple-400',
    'bg-gradient-to-r from-sky-400 to-indigo-400',
    'bg-gradient-to-r from-emerald-400 to-teal-400',
    'bg-gradient-to-r from-amber-400 to-orange-400',
    'bg-gradient-to-r from-rose-400 to-pink-400',
  ];

  ngOnInit(): void {
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
    this.fetchReport();
  }

  onStartDateChange(value: string): void {
    this.startDate.set(value);
    if (this.initialized && this.startDate() && this.endDate()) {
      this.fetchReport();
    }
  }

  onEndDateChange(value: string): void {
    this.endDate.set(value);
    if (this.initialized && this.startDate() && this.endDate()) {
      this.fetchReport();
    }
  }

  private toDateInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  fetchReport(): void {
    if (!this.startDate() || !this.endDate()) return;
    this.isLoading.set(true);
    this.errorMsg.set('');

    const start = `${this.startDate()} 00:00:00`.replace(' ', '%20');
    const end = `${this.endDate()} 23:59:59`.replace(' ', '%20');

    this.http
      .get<Product[]>(`${this.api}/reports/${start}/${end}`)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => this.products.set(data),
        error: (err) => this.errorMsg.set(err?.error?.message ?? 'Failed to load report.'),
      });
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
    this.fetchReport();
  }

  getColor(name: string): string | null {
    const lower = name.toLowerCase();
    for (const [key, value] of Object.entries(this.colorMap)) {
      if (lower.includes(key)) return value;
    }
    return null;
  }

  getAccentColor(index: number): string {
    return this.accentColors[index % this.accentColors.length];
  }

  getBarColor(index: number): string {
    return this.barColors[index % this.barColors.length];
  }
}

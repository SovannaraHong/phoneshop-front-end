import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { ProductStatsService } from '../../shared/utils/product-shared/product-stats-service';
import { ReportService } from '../../core/services/report/report-service';
import { ReportProduct, ExpenseReport } from '../reports/reports';
import { SumPipe } from '../../shared/pipes/SumPip';
import { BrandType } from '../../core/models/brand.model';
import { BrandService } from '../../core/services/brand/brand-service';

Chart.register(...registerables);

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface StockTableItem {
  name: string;
  sku: string;
  category: string;
  stock: number;
  status: 'low' | 'out';
}

interface TopRated {
  name: string;
  stars: number;
}

interface Category {
  label: string;
  value: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SumPipe],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnInit, AfterViewInit, OnDestroy {
  readonly state = inject(ProductStatsService);
  readonly reportService = inject(ReportService);
  private readonly cdr = inject(ChangeDetectorRef);
  private brandService = inject(BrandService);

  @Input() toggleLogin!: () => void;

  @ViewChild('salesCanvas') salesCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('catCanvas') catCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('trendCanvas') trendCanvas!: ElementRef<HTMLCanvasElement>;

  // ── Chart instances ───────────────────────────────────────────────────────
  private salesChart?: Chart;
  private catChart?: Chart;
  private trendChart?: Chart;

  // ── Period switcher ───────────────────────────────────────────────────────
  periods = ['Week', 'Month', 'Year'];
  activePeriod = 'Week';

  // ── Period-filtered stats (for top cards) ─────────────────────────────────
  periodRevenue = 0;
  periodSoldUnits = 0;

  // ── Period-filtered data ──────────────────────────────────────────────────
  periodSalesReport: ReportProduct[] = [];
  periodBestSellers: ReportProduct[] = [];
  periodExpenses: ExpenseReport[] = [];

  salesReportLoading = false;
  bestSellersLoading = false;
  expensesLoading = false;

  readonly salesBarColors = ['#5b3ee6', '#7c5ce6', '#9d7ee6', '#bea0e6', '#dfc2e6'];
  readonly expenseBarColors = ['#5b3ee6', '#f59e0b', '#10b981', '#ec4899', '#6366f1', '#f97316'];

  private fallbackSalesData: Record<string, { labels: string[]; data: number[] }> = {
    Week: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      data: [4200, 5800, 3900, 6700, 8100, 9500, 7200],
    },
    Month: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      data: [28000, 32000, 27000, 35000, 41000, 38000, 44000, 42000, 48000, 51000, 47000, 55000],
    },
    Year: {
      labels: ['2020', '2021', '2022', '2023', '2024', '2025'],
      data: [180000, 210000, 245000, 290000, 340000, 390000],
    },
  };

  categories: Category[] = [];
  catColors = ['#5b3ee6', '#f59e0b', '#10b981', '#ec4899', '#3b82f6', '#f97316', '#8b5cf6'];

  private fallbackCategories: Category[] = [
    { label: 'Flagship', value: 42 },
    { label: 'Mid-range', value: 28 },
    { label: 'Budget', value: 15 },
    { label: 'Accessories', value: 9 },
    { label: 'Refurb', value: 6 },
  ];

  private fallbackTrendData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    data: [140, 168, 155, 172, 185, 197, 110],
  };

  // ── Static stock table ────────────────────────────────────────────────────
  stockTableItems: StockTableItem[] = [
    { name: 'Oppo Reno 11', sku: 'OPR-11-128', category: 'Smartphone', stock: 2, status: 'low' },
    { name: 'iPhone 15 Pro', sku: 'APL-15P-256', category: 'Smartphone', stock: 0, status: 'out' },
    { name: 'Samsung S24 Ultra', sku: 'SAM-S24U', category: 'Smartphone', stock: 0, status: 'out' },
    { name: 'Anker 65W Charger', sku: 'ANK-65W', category: 'Accessory', stock: 4, status: 'low' },
    { name: 'iPad Air 5', sku: 'APL-IPAD5', category: 'Tablet', stock: 2, status: 'low' },
    { name: 'Xiaomi Band 9', sku: 'XMI-B9', category: 'Wearable', stock: 1, status: 'low' },
  ];

  topRated: TopRated[] = [
    { name: 'iPhone 15 Pro', stars: 4.9 },
    { name: 'Samsung S24 Ultra', stars: 4.7 },
    { name: 'Google Pixel 8', stars: 4.6 },
  ];

  // ─────────────────────────────────────────────────────────────────────────
  // LIFECYCLE
  // ─────────────────────────────────────────────────────────────────────────

  brand: BrandType[] = [];

  loadBrands() {
    this.brandService.getBrands().subscribe({
      next: (res: any) => {
        console.log('Brand API Response:', res);

        this.brand = res;

        console.log('Brands Loaded:', this.brand);
      },
    });
  }
  ngOnInit(): void {
    this.loadBrands();
  }

  ngAfterViewInit(): void {
    this.loadAllForPeriod(this.activePeriod);
    this.loadTrendChart();
  }

  ngOnDestroy(): void {
    this.salesChart?.destroy();
    this.catChart?.destroy();
    this.trendChart?.destroy();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PERIOD BUTTON
  // ─────────────────────────────────────────────────────────────────────────

  selectPeriod(period: string): void {
    this.activePeriod = period;
    this.loadAllForPeriod(period);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MASTER LOAD
  // ─────────────────────────────────────────────────────────────────────────

  private loadAllForPeriod(period: string): void {
    const { start, end } = this.getDateRange(period);
    this.loadSalesChart(period);
    this.loadCatChart(start, end);
    this.loadPeriodSalesReport(start, end);
    this.loadPeriodExpenses(start, end);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DATE RANGE HELPER
  // ─────────────────────────────────────────────────────────────────────────

  private getDateRange(period: string): { start: string; end: string } {
    const now = new Date();
    const toStr = (d: Date) => d.toISOString().split('T')[0];
    const end = toStr(now);

    if (period === 'Week') {
      const day = now.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      const first = new Date(now);
      first.setDate(now.getDate() + diff);
      return { start: toStr(first), end };
    } else if (period === 'Month') {
      return { start: toStr(new Date(now.getFullYear(), 0, 1)), end };
    } else {
      return { start: toStr(new Date(now.getFullYear() - 5, 0, 1)), end };
    }
  }

  // ═════════════════════════════════════════════════════════════════════════
  // PERIOD SALES REPORT TABLE + REVENUE/SOLD CARD STATS
  // ═════════════════════════════════════════════════════════════════════════

  private loadPeriodSalesReport(start: string, end: string): void {
    this.salesReportLoading = true;
    this.bestSellersLoading = true;
    this.cdr.markForCheck();

    this.reportService.getSalesReport(start, end).subscribe({
      next: (data: ReportProduct[]) => {
        this.periodSalesReport = data;

        // ── Update top-card stats filtered to selected period ──
        this.periodRevenue = data.reduce((sum, item) => sum + item.totalAmount, 0);
        this.periodSoldUnits = data.reduce((sum, item) => sum + item.productUnit, 0);

        // Best sellers: top 5 by totalAmount
        this.periodBestSellers = [...data]
          .sort((a, b) => b.totalAmount - a.totalAmount)
          .slice(0, 5);

        this.salesReportLoading = false;
        this.bestSellersLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.periodSalesReport = [];
        this.periodBestSellers = [];
        this.periodRevenue = 0;
        this.periodSoldUnits = 0;
        this.salesReportLoading = false;
        this.bestSellersLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  // ═════════════════════════════════════════════════════════════════════════
  // PERIOD EXPENSES TABLE
  // ═════════════════════════════════════════════════════════════════════════

  private loadPeriodExpenses(start: string, end: string): void {
    this.expensesLoading = true;
    this.cdr.markForCheck();

    this.reportService.getExpenseReport(start, end).subscribe({
      next: (data: ExpenseReport[]) => {
        this.periodExpenses = data;
        this.expensesLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.periodExpenses = [];
        this.expensesLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  // ═════════════════════════════════════════════════════════════════════════
  // BAR WIDTH HELPERS (percentage relative to max item in each list)
  // ═════════════════════════════════════════════════════════════════════════

  getSalesBarWidth(amount: number): number {
    const max = Math.max(...this.periodSalesReport.map((i) => i.totalAmount), 1);
    return Math.round((amount / max) * 100);
  }

  getSalesBarColor(index: number): string {
    return this.salesBarColors[index % this.salesBarColors.length];
  }

  getExpenseBarWidth(amount: number): number {
    const max = Math.max(...this.periodExpenses.map((e) => e.totalAmount), 1);
    return Math.round((amount / max) * 100);
  }

  // ═════════════════════════════════════════════════════════════════════════
  // CHART 1 – SALES BAR CHART
  // ═════════════════════════════════════════════════════════════════════════

  private loadSalesChart(period: string): void {
    const { start, end } = this.getDateRange(period);

    this.reportService.getSalesReport(start, end).subscribe({
      next: (data: ReportProduct[]) => {
        const grouped = this.groupSalesByPeriod(data, period);
        this.buildSalesChart(grouped.labels, grouped.values);
      },
      error: () => {
        const fb = this.fallbackSalesData[period];
        this.buildSalesChart(fb.labels, fb.data);
      },
    });
  }

  private groupSalesByPeriod(
    data: ReportProduct[],
    period: string,
  ): { labels: string[]; values: number[] } {
    const now = new Date();

    if (period === 'Week') {
      const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const map = new Map<string, number>(dayOrder.map((d) => [d, 0]));
      data.forEach((item) => {
        const key = new Date(item.soldDate).toLocaleDateString('en-US', { weekday: 'short' });
        if (map.has(key)) map.set(key, map.get(key)! + item.totalAmount);
      });
      return { labels: dayOrder, values: dayOrder.map((d) => map.get(d)!) };
    }

    if (period === 'Month') {
      const monthNames = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      const currentMonthIdx = now.getMonth();
      const labels = monthNames.slice(0, currentMonthIdx + 1);
      const map = new Map<string, number>(labels.map((m) => [m, 0]));
      data.forEach((item) => {
        const key = new Date(item.soldDate).toLocaleDateString('en-US', { month: 'short' });
        if (map.has(key)) map.set(key, map.get(key)! + item.totalAmount);
      });
      return { labels, values: labels.map((m) => map.get(m)!) };
    }

    const currentYear = now.getFullYear();
    const years = Array.from({ length: 6 }, (_, i) => String(currentYear - 5 + i));
    const map = new Map<string, number>(years.map((y) => [y, 0]));
    data.forEach((item) => {
      const key = String(new Date(item.soldDate).getFullYear());
      if (map.has(key)) map.set(key, map.get(key)! + item.totalAmount);
    });
    return { labels: years, values: years.map((y) => map.get(y)!) };
  }

  private buildSalesChart(labels: string[], data: number[]): void {
    if (this.salesChart) this.salesChart.destroy();

    this.salesChart = new Chart(this.salesCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Revenue',
            data,
            backgroundColor: 'rgba(91,62,230,0.15)',
            borderColor: '#5b3ee6',
            borderWidth: 1.5,
            borderRadius: 6,
            hoverBackgroundColor: 'rgba(91,62,230,0.3)',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: (ctx) => '$' + (ctx.parsed.y as number).toLocaleString() },
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 } } },
          y: {
            grid: { color: 'rgba(0,0,0,0.04)' },
            ticks: { callback: (v) => '$' + Number(v) / 1000 + 'k', font: { size: 11 } },
          },
        },
      },
    });
  }

  // ═════════════════════════════════════════════════════════════════════════
  // CHART 2 – CATEGORY DOUGHNUT
  // ═════════════════════════════════════════════════════════════════════════

  loadCatChart(start?: string, end?: string): void {
    if (!start || !end) {
      const range = this.getDateRange(this.activePeriod);
      start = range.start;
      end = range.end;
    }

    this.reportService.getSalesReport(start, end).subscribe({
      next: (data: ReportProduct[]) => {
        const map = new Map<string, number>();
        data.forEach((item) => {
          if (item.totalAmount > 0)
            map.set(item.productName, (map.get(item.productName) ?? 0) + item.totalAmount);
        });

        const sorted = [...map.entries()].sort((a, b) => b[1] - a[1]);
        const total = sorted.reduce((sum, [, v]) => sum + v, 0) || 1;
        const MAX_SLICES = 7;
        let newCats: Category[];

        if (sorted.length <= MAX_SLICES) {
          newCats = sorted.map(([label, value]) => ({
            label,
            value: Math.round((value / total) * 100),
          }));
        } else {
          const top = sorted.slice(0, MAX_SLICES - 1);
          const rest = sorted.slice(MAX_SLICES - 1);
          const restSum = rest.reduce((sum, [, v]) => sum + v, 0);
          newCats = [
            ...top.map(([label, value]) => ({ label, value: Math.round((value / total) * 100) })),
            { label: 'Others', value: Math.round((restSum / total) * 100) },
          ];
        }

        this.categories = newCats;
        this.cdr.markForCheck();
        this.buildCatChart(
          newCats.map((c) => c.label),
          newCats.map((c) => c.value),
        );
      },
      error: () => {
        this.categories = this.fallbackCategories;
        this.cdr.markForCheck();
        this.buildCatChart(
          this.fallbackCategories.map((c) => c.label),
          this.fallbackCategories.map((c) => c.value),
        );
      },
    });
  }

  private buildCatChart(labels: string[], data: number[]): void {
    if (this.catChart) this.catChart.destroy();

    this.catChart = new Chart(this.catCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: this.catColors.slice(0, labels.length),
            borderWidth: 2,
            borderColor: '#fff',
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx) => ctx.label + ': ' + ctx.parsed + '%' } },
        },
      },
    });
  }

  // ═════════════════════════════════════════════════════════════════════════
  // CHART 3 – WEEKLY TREND LINE
  // ═════════════════════════════════════════════════════════════════════════

  private loadTrendChart(): void {
    const { start, end } = this.getDateRange('Week');

    this.reportService.getSalesReport(start, end).subscribe({
      next: (data: ReportProduct[]) => {
        const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const map = new Map<string, number>(dayOrder.map((d) => [d, 0]));
        data.forEach((item) => {
          const key = new Date(item.soldDate).toLocaleDateString('en-US', { weekday: 'short' });
          if (map.has(key)) map.set(key, map.get(key)! + item.totalAmount);
        });
        this.buildTrendChart(
          dayOrder,
          dayOrder.map((d) => map.get(d)!),
        );
      },
      error: () => {
        this.buildTrendChart(this.fallbackTrendData.labels, this.fallbackTrendData.data);
      },
    });
  }

  private buildTrendChart(labels: string[], data: number[]): void {
    if (this.trendChart) this.trendChart.destroy();

    this.trendChart = new Chart(this.trendCanvas.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Sales',
            data,
            borderColor: '#5b3ee6',
            borderWidth: 2,
            pointBackgroundColor: '#5b3ee6',
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.35,
            fill: true,
            backgroundColor: 'rgba(91,62,230,0.08)',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: (ctx) => 'Sales: $' + (ctx.parsed.y as number).toLocaleString() },
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#9ca3af' } },
          y: {
            grid: { color: 'rgba(0,0,0,0.04)' },
            ticks: {
              callback: (v) => '$' + Number(v) / 1000 + 'k',
              font: { size: 11 },
              color: '#9ca3af',
            },
          },
        },
      },
    });
  }

  // ── Star rating helper ────────────────────────────────────────────────────
  getStars(rating: number): boolean[] {
    return Array.from({ length: 5 }, (_, i) => i < Math.round(rating));
  }
  getBrandName(id: number): string {
    return this.brand?.find((b) => b.id === id)?.name || '';
  }
}

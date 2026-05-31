import {
  AfterViewInit,
  ChangeDetectionStrategy,
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

Chart.register(...registerables);

interface StockAlert {
  name: string;
  stock: number;
  status: 'low' | 'out';
}

interface StockTableItem {
  name: string;
  sku: string;
  category: string;
  stock: number;
  status: 'low' | 'out';
}

interface BestSeller {
  rank: number;
  icon: string;
  name: string;
  sold: number;
  revenue: string;
}

interface Expense {
  category: string;
  value: number;
  pct: number;
  color: string;
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
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnInit, AfterViewInit, OnDestroy {
  readonly state = inject(ProductStatsService);

  @Input() toggleLogin!: () => void;

  @ViewChild('salesCanvas') salesCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('catCanvas') catCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('trendCanvas') trendCanvas!: ElementRef<HTMLCanvasElement>;

  private salesChart?: Chart;
  private catChart?: Chart;
  private trendChart?: Chart;

  // ── Stats ──────────────────────────────────────────────
  stats = {
    totalRevenue: 48290,
    productsSold: 1834,
    totalCustomers: 3412,
    outOfStock: 12,
  };

  // ── Period switcher ───────────────────────────────────
  periods = ['Week', 'Month', 'Year'];
  activePeriod = 'Month';

  private salesData: Record<string, { labels: string[]; data: number[] }> = {
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

  // ── Categories ────────────────────────────────────────
  categories: Category[] = [
    { label: 'Flagship', value: 42 },
    { label: 'Mid-range', value: 28 },
    { label: 'Budget', value: 15 },
    { label: 'Accessories', value: 9 },
    { label: 'Refurb', value: 6 },
  ];
  catColors = ['#5b3ee6', '#f59e0b', '#10b981', '#ec4899', '#3b82f6'];

  // ── Stock alerts (legacy, kept for compatibility) ─────
  stockAlerts: StockAlert[] = [
    { name: 'iPhone 15 Pro Max', stock: 2, status: 'low' },
    { name: 'Samsung S24 Ultra', stock: 0, status: 'out' },
    { name: 'Google Pixel 8', stock: 4, status: 'low' },
    { name: 'OnePlus 12', stock: 0, status: 'out' },
    { name: 'Xiaomi 14', stock: 1, status: 'low' },
    { name: 'Sony Xperia 1 V', stock: 0, status: 'out' },
    { name: 'Realme GT 5', stock: 3, status: 'low' },
  ];

  // ── Stock Table Items (new bottom section) ─────────────
  stockTableItems: StockTableItem[] = [
    { name: 'Oppo Reno 11', sku: 'OPR-11-128', category: 'Smartphone', stock: 2, status: 'low' },
    { name: 'iPhone 15 Pro', sku: 'APL-15P-256', category: 'Smartphone', stock: 0, status: 'out' },
    { name: 'Samsung S24 Ultra', sku: 'SAM-S24U', category: 'Smartphone', stock: 0, status: 'out' },
    { name: 'Anker 65W Charger', sku: 'ANK-65W', category: 'Accessory', stock: 4, status: 'low' },
    { name: 'iPad Air 5', sku: 'APL-IPAD5', category: 'Tablet', stock: 2, status: 'low' },
    { name: 'Xiaomi Band 9', sku: 'XMI-B9', category: 'Wearable', stock: 1, status: 'low' },
  ];

  // ── Best sellers ──────────────────────────────────────
  bestSellers: BestSeller[] = [
    { rank: 1, icon: '📱', name: 'iPhone 15 Pro', sold: 312, revenue: '$405,600' },
    { rank: 2, icon: '📲', name: 'Samsung S24', sold: 278, revenue: '$222,400' },
    { rank: 3, icon: '🔋', name: 'Pixel 8 Pro', sold: 210, revenue: '$168,000' },
    { rank: 4, icon: '📡', name: 'OnePlus 12', sold: 189, revenue: '$113,400' },
    { rank: 5, icon: '💾', name: 'Xiaomi 14 Pro', sold: 144, revenue: '$86,400' },
  ];

  // ── Expenses ──────────────────────────────────────────
  expenses: Expense[] = [
    { category: 'Procurement', value: 6200, pct: 50, color: '#5b3ee6' },
    { category: 'Marketing', value: 2800, pct: 22, color: '#f59e0b' },
    { category: 'Operations', value: 1900, pct: 15, color: '#10b981' },
    { category: 'Logistics', value: 900, pct: 7, color: '#ec4899' },
    { category: 'Misc', value: 650, pct: 5, color: '#94a3b8' },
  ];

  // ── Top rated ─────────────────────────────────────────
  topRated: TopRated[] = [
    { name: 'iPhone 15 Pro', stars: 4.9 },
    { name: 'Samsung S24 Ultra', stars: 4.7 },
    { name: 'Google Pixel 8', stars: 4.6 },
  ];

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.buildSalesChart('Month');
    this.buildCatChart();
    this.buildTrendChart();
  }

  ngOnDestroy(): void {
    this.salesChart?.destroy();
    this.catChart?.destroy();
    this.trendChart?.destroy();
  }

  selectPeriod(period: string): void {
    this.activePeriod = period;
    this.buildSalesChart(period);
  }

  private buildSalesChart(period: string): void {
    const d = this.salesData[period];
    if (this.salesChart) this.salesChart.destroy();
    this.salesChart = new Chart(this.salesCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: d.labels,
        datasets: [
          {
            label: 'Revenue',
            data: d.data,
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
            callbacks: {
              label: (ctx) => '$' + (ctx.parsed.y as number).toLocaleString(),
            },
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 } } },
          y: {
            grid: { color: 'rgba(0,0,0,0.04)' },
            ticks: {
              callback: (v) => '$' + Number(v) / 1000 + 'k',
              font: { size: 11 },
            },
          },
        },
      },
    });
  }

  private buildCatChart(): void {
    this.catChart = new Chart(this.catCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: this.categories.map((c) => c.label),
        datasets: [
          {
            data: this.categories.map((c) => c.value),
            backgroundColor: this.catColors,
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
          tooltip: {
            callbacks: { label: (ctx) => ctx.label + ': ' + ctx.parsed + '%' },
          },
        },
      },
    });
  }

  private buildTrendChart(): void {
    this.trendChart = new Chart(this.trendCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Sales',
            data: [140, 168, 155, 172, 185, 197, 110],
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
            callbacks: {
              label: (ctx) => 'Sales: ' + ctx.parsed.y,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 11 }, color: '#9ca3af' },
          },
          y: {
            min: 100,
            grid: { color: 'rgba(0,0,0,0.04)' },
            ticks: { font: { size: 11 }, color: '#9ca3af' },
          },
        },
      },
    });
  }

  getStars(rating: number): boolean[] {
    return Array.from({ length: 5 }, (_, i) => i < Math.round(rating));
  }
}

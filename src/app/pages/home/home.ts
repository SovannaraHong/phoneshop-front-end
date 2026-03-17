import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArcElement, Chart, DoughnutController, Tooltip } from 'chart.js';

Chart.register(DoughnutController, ArcElement, Tooltip);

export interface Product {
  name: string;
  short: string;
  source: string;
  dot: string;
  rating: number;
  sold: number;
  rev: number;
  badge: string;
  badgeClass: string;
  img: string;
}

export interface RangeData {
  label: string;
  soldTrend: string;
  revTrend: string;
  products: Product[];
}
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('donutCanvas') donutCanvas!: ElementRef<HTMLCanvasElement>;

  currentRange = '7d';
  donutChart: Chart | null = null;

  readonly COLORS = ['#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7'];

  readonly ranges = [
    { key: '7d', label: '7 days' },
    { key: '30d', label: '30 days' },
    { key: '3m', label: '3 months' },
    { key: '1y', label: '1 year' },
  ];

  readonly DATA: Record<string, RangeData> = {
    '7d': {
      label: 'Last 7 days',
      soldTrend: '+18%',
      revTrend: '+12%',
      products: [
        {
          name: 'Macbook Pro M1 Pro 14" 512GB',
          short: 'MBP 14"',
          source: 'Ali Express',
          dot: '#f97316',
          rating: 4.8,
          sold: 68,
          rev: 12920,
          badge: 'Best Seller',
          badgeClass: 'bg-orange-50 text-orange-600 border-orange-100',
          img: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp14-spacegray-select-202110?wid=200&hei=140&fmt=webp&qlt=80',
        },
        {
          name: 'Monitor MSI 27" Modern MD271UL 4K',
          short: 'MSI 27"',
          source: 'Amazon',
          dot: '#eab308',
          rating: 4.9,
          sold: 54,
          rev: 10260,
          badge: 'Top Rated',
          badgeClass: 'bg-yellow-50 text-yellow-600 border-yellow-100',
          img: 'https://storage-asset.msi.com/global/picture/image/feature/monitor/MD271UL/MD271UL-overview-1.png',
        },
        {
          name: 'Macbook Air M1 2020 13" 256GB',
          short: 'MBA 13"',
          source: 'Tokopedia',
          dot: '#22c55e',
          rating: 4.7,
          sold: 47,
          rev: 7285,
          badge: 'Trending',
          badgeClass: 'bg-green-50 text-green-600 border-green-100',
          img: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-gold-select-201810?wid=200&hei=140&fmt=webp&qlt=80',
        },
        {
          name: 'Macbook Pro M1 2020 13" 512GB',
          short: 'MBP 13"',
          source: 'Shopify',
          dot: '#16a34a',
          rating: 4.6,
          sold: 39,
          rev: 7410,
          badge: 'Popular',
          badgeClass: 'bg-blue-50 text-blue-600 border-blue-100',
          img: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp-spacegray-select-202011?wid=200&hei=140&fmt=webp&qlt=80',
        },
        {
          name: 'Apple 32" Pro Display XDR 6K',
          short: 'Pro XDR',
          source: 'eBay',
          dot: '#3b82f6',
          rating: 4.9,
          sold: 11,
          rev: 55000,
          badge: 'Premium',
          badgeClass: 'bg-purple-50 text-purple-600 border-purple-100',
          img: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/pro-display-xdr-stand-gallery1-202312?wid=200&hei=140&fmt=webp&qlt=80',
        },
      ],
    },
    '30d': {
      label: 'Last 30 days',
      soldTrend: '+24%',
      revTrend: '+19%',
      products: [
        {
          name: 'Macbook Pro M1 Pro 14" 512GB',
          short: 'MBP 14"',
          source: 'Ali Express',
          dot: '#f97316',
          rating: 4.8,
          sold: 284,
          rev: 53960,
          badge: 'Best Seller',
          badgeClass: 'bg-orange-50 text-orange-600 border-orange-100',
          img: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp14-spacegray-select-202110?wid=200&hei=140&fmt=webp&qlt=80',
        },
        {
          name: 'Macbook Air M1 2020 13" 256GB',
          short: 'MBA 13"',
          source: 'Tokopedia',
          dot: '#22c55e',
          rating: 4.7,
          sold: 196,
          rev: 30380,
          badge: 'Trending',
          badgeClass: 'bg-green-50 text-green-600 border-green-100',
          img: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-gold-select-201810?wid=200&hei=140&fmt=webp&qlt=80',
        },
        {
          name: 'Monitor MSI 27" Modern MD271UL 4K',
          short: 'MSI 27"',
          source: 'Amazon',
          dot: '#eab308',
          rating: 4.9,
          sold: 172,
          rev: 32680,
          badge: 'Top Rated',
          badgeClass: 'bg-yellow-50 text-yellow-600 border-yellow-100',
          img: 'https://storage-asset.msi.com/global/picture/image/feature/monitor/MD271UL/MD271UL-overview-1.png',
        },
        {
          name: 'Macbook Pro M1 2020 13" 512GB',
          short: 'MBP 13"',
          source: 'Shopify',
          dot: '#16a34a',
          rating: 4.6,
          sold: 143,
          rev: 27170,
          badge: 'Popular',
          badgeClass: 'bg-blue-50 text-blue-600 border-blue-100',
          img: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp-spacegray-select-202011?wid=200&hei=140&fmt=webp&qlt=80',
        },
        {
          name: 'Apple 32" Pro Display XDR 6K',
          short: 'Pro XDR',
          source: 'eBay',
          dot: '#3b82f6',
          rating: 4.9,
          sold: 38,
          rev: 190000,
          badge: 'Premium',
          badgeClass: 'bg-purple-50 text-purple-600 border-purple-100',
          img: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/pro-display-xdr-stand-gallery1-202312?wid=200&hei=140&fmt=webp&qlt=80',
        },
      ],
    },
    '3m': {
      label: 'Last 3 months',
      soldTrend: '+31%',
      revTrend: '+28%',
      products: [
        {
          name: 'Macbook Pro M1 Pro 14" 512GB',
          short: 'MBP 14"',
          source: 'Ali Express',
          dot: '#f97316',
          rating: 4.8,
          sold: 820,
          rev: 155800,
          badge: 'Best Seller',
          badgeClass: 'bg-orange-50 text-orange-600 border-orange-100',
          img: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp14-spacegray-select-202110?wid=200&hei=140&fmt=webp&qlt=80',
        },
        {
          name: 'Monitor MSI 27" Modern MD271UL 4K',
          short: 'MSI 27"',
          source: 'Amazon',
          dot: '#eab308',
          rating: 4.9,
          sold: 590,
          rev: 112100,
          badge: 'Top Rated',
          badgeClass: 'bg-yellow-50 text-yellow-600 border-yellow-100',
          img: 'https://storage-asset.msi.com/global/picture/image/feature/monitor/MD271UL/MD271UL-overview-1.png',
        },
        {
          name: 'Macbook Air M1 2020 13" 256GB',
          short: 'MBA 13"',
          source: 'Tokopedia',
          dot: '#22c55e',
          rating: 4.7,
          sold: 510,
          rev: 79050,
          badge: 'Trending',
          badgeClass: 'bg-green-50 text-green-600 border-green-100',
          img: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-gold-select-201810?wid=200&hei=140&fmt=webp&qlt=80',
        },
        {
          name: 'Macbook Pro M1 2020 13" 512GB',
          short: 'MBP 13"',
          source: 'Shopify',
          dot: '#16a34a',
          rating: 4.6,
          sold: 390,
          rev: 74100,
          badge: 'Popular',
          badgeClass: 'bg-blue-50 text-blue-600 border-blue-100',
          img: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp-spacegray-select-202011?wid=200&hei=140&fmt=webp&qlt=80',
        },
        {
          name: 'Apple 32" Pro Display XDR 6K',
          short: 'Pro XDR',
          source: 'eBay',
          dot: '#3b82f6',
          rating: 4.9,
          sold: 92,
          rev: 460000,
          badge: 'Premium',
          badgeClass: 'bg-purple-50 text-purple-600 border-purple-100',
          img: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/pro-display-xdr-stand-gallery1-202312?wid=200&hei=140&fmt=webp&qlt=80',
        },
      ],
    },
    '1y': {
      label: 'This year',
      soldTrend: '+42%',
      revTrend: '+38%',
      products: [
        {
          name: 'Macbook Pro M1 Pro 14" 512GB',
          short: 'MBP 14"',
          source: 'Ali Express',
          dot: '#f97316',
          rating: 4.8,
          sold: 3240,
          rev: 615600,
          badge: 'Best Seller',
          badgeClass: 'bg-orange-50 text-orange-600 border-orange-100',
          img: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp14-spacegray-select-202110?wid=200&hei=140&fmt=webp&qlt=80',
        },
        {
          name: 'Monitor MSI 27" Modern MD271UL 4K',
          short: 'MSI 27"',
          source: 'Amazon',
          dot: '#eab308',
          rating: 4.9,
          sold: 2180,
          rev: 414200,
          badge: 'Top Rated',
          badgeClass: 'bg-yellow-50 text-yellow-600 border-yellow-100',
          img: 'https://storage-asset.msi.com/global/picture/image/feature/monitor/MD271UL/MD271UL-overview-1.png',
        },
        {
          name: 'Macbook Air M1 2020 13" 256GB',
          short: 'MBA 13"',
          source: 'Tokopedia',
          dot: '#22c55e',
          rating: 4.7,
          sold: 1920,
          rev: 297600,
          badge: 'Trending',
          badgeClass: 'bg-green-50 text-green-600 border-green-100',
          img: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-gold-select-201810?wid=200&hei=140&fmt=webp&qlt=80',
        },
        {
          name: 'Macbook Pro M1 2020 13" 512GB',
          short: 'MBP 13"',
          source: 'Shopify',
          dot: '#16a34a',
          rating: 4.6,
          sold: 1560,
          rev: 296400,
          badge: 'Popular',
          badgeClass: 'bg-blue-50 text-blue-600 border-blue-100',
          img: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp-spacegray-select-202011?wid=200&hei=140&fmt=webp&qlt=80',
        },
        {
          name: 'Apple 32" Pro Display XDR 6K',
          short: 'Pro XDR',
          source: 'eBay',
          dot: '#3b82f6',
          rating: 4.9,
          sold: 320,
          rev: 1600000,
          badge: 'Premium',
          badgeClass: 'bg-purple-50 text-purple-600 border-purple-100',
          img: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/pro-display-xdr-stand-gallery1-202312?wid=200&hei=140&fmt=webp&qlt=80',
        },
      ],
    },
  };

  get current(): RangeData {
    return this.DATA[this.currentRange];
  }
  get products(): Product[] {
    return this.current.products;
  }
  get maxSold(): number {
    return Math.max(...this.products.map((p) => p.sold));
  }
  get totalRev(): number {
    return this.products.reduce((s, p) => s + p.rev, 0);
  }
  get totalSold(): number {
    return this.products.reduce((s, p) => s + p.sold, 0);
  }
  get avgRating(): string {
    return (this.products.reduce((s, p) => s + p.rating, 0) / this.products.length).toFixed(1);
  }

  barPct(sold: number): number {
    return Math.round((sold / this.maxSold) * 100);
  }
  revShare(rev: number): string {
    return ((rev / this.totalRev) * 100).toFixed(1);
  }
  fmtSold(n: number): string {
    return n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n);
  }
  fmtRev(n: number): string {
    return n >= 1000 ? '$' + (n / 1000).toFixed(1) + 'k' : '$' + n;
  }
  color(i: number): string {
    return this.COLORS[i];
  }
  trackByIndex(i: number): number {
    return i;
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.initDonut();
  }

  setRange(range: string): void {
    this.currentRange = range;
    setTimeout(() => this.updateDonut(), 50);
  }

  initDonut(): void {
    const ctx = this.donutCanvas.nativeElement.getContext('2d');
    if (!ctx) return;
    this.donutChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: this.products.map((p) => p.short),
        datasets: [
          {
            data: this.products.map((p) => p.rev),
            backgroundColor: this.COLORS,
            borderWidth: 0,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: '72%',
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        animation: { duration: 600 },
      },
    });
  }

  updateDonut(): void {
    if (!this.donutChart) return;
    this.donutChart.data.datasets[0].data = this.products.map((p) => p.rev);
    this.donutChart.update();
  }

  ngOnDestroy(): void {
    this.donutChart?.destroy();
  }
}

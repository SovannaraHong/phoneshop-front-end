import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
export interface Product {
  productId: number;
  productName: string;
  productUnit: number;
  totalAmount: number;
}

@Component({
  selector: 'app-reports',
  imports: [CommonModule, DecimalPipe],
  templateUrl: './reports.html',
  styleUrl: './reports.css',
})
export class Reports implements OnInit {
  products: Product[] = [
    { productId: 38, productName: 'Huawei Pura 80 red', productUnit: 40, totalAmount: 52000.0 },
    // Replace with your API data
  ];

  reportDate: string = '';
  totalUnits: number = 0;
  grandTotal: number = 0;
  maxUnits: number = 1;
  maxAmount: number = 1;

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

  // Rotating accent bars for cards
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
    this.reportDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    this.totalUnits = this.products.reduce((sum, p) => sum + p.productUnit, 0);
    this.grandTotal = this.products.reduce((sum, p) => sum + p.totalAmount, 0);
    this.maxUnits = Math.max(...this.products.map((p) => p.productUnit), 1);
    this.maxAmount = Math.max(...this.products.map((p) => p.totalAmount), 1);
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

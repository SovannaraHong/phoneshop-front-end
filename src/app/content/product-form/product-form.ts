import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';

import { ColorType } from '../../core/models/color.model';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { BrandService } from '../../core/services/brand/brand-service';
import { BehaviorSubject, switchMap } from 'rxjs';
import { BrandType } from '../../core/models/brand.model';
import { ColorService } from '../../core/services/color/color-service';
import { ModelService } from '../../core/services/model/model-service';
import { ModelType } from '../../core/models/model.model';
@Component({
  selector: 'app-product-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductForm implements OnInit {
  private brandService = inject(BrandService);
  private colorService = inject(ColorService);
  private modelService = inject(ModelService);
  private fb = inject(FormBuilder);
  productForm!: FormGroup;

  selectedColor = signal<string | null>(null);

  colors: ColorType[] = [
    { id: 1, name: 'black', hex: '#1a1a1a' },
    { id: 2, name: 'white', hex: '#f5f5f5' },
    { id: 3, name: 'silver', hex: '#c0c0c0' },
    { id: 4, name: 'gold', hex: '#d4af37' },
    { id: 5, name: 'blue', hex: '#3b82f6' },
    { id: 6, name: 'purple', hex: '#a855f7' },
    { id: 7, name: 'green', hex: '#22c55e' },
    { id: 8, name: 'red', hex: '#ef4444' },
    { id: 9, name: 'pink', hex: '#ec4899' },
    { id: 10, name: 'orange', hex: '#f97316' },
    { id: 11, name: 'titanium', hex: '#8a8a8a' },
    { id: 12, name: 'graphite', hex: '#4b4b4b' },
  ];

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

  ngOnInit(): void {
    this.productForm = this.fb.group({
      brand: this.fb.array([]),
      model: this.fb.array([]),
      color: this.fb.array([]),
      price: [''],
      unit: [''],
      type: [''],
      des: [''],
      status: [false],
    });
  }
  onSelectColor(color: ColorType) {
    this.selectedColor.set(color.hex);
  }
  reloadColors() {
    this.refresh$.next();
  }
}

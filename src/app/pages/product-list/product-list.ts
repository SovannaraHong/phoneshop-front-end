import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BrandService } from '../../core/services/brand/brand-service';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { BrandType } from '../../core/models/brand.model';
import { CommonModule } from '@angular/common';
import { ProductType } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product/product-service';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductList implements OnInit {
  brandList$!: Observable<BrandType[]>;
  productList$!: Observable<ProductType[]>;
  filteredProducts$!: Observable<ProductType[]>;
  private selectedBrand$ = new BehaviorSubject<BrandType | null>(null);

  selectedBrand?: BrandType;

  constructor(
    private brandService: BrandService,
    private productService: ProductService,
  ) {}
  ngOnInit(): void {
    this.loadProducts();
    this.loadBrands();
    this.filteredProducts$ = combineLatest([this.productList$, this.selectedBrand$]).pipe(
      map(([products, brand]) => {
        if (!brand) return products;
        return products.filter((p) => p.brandId === brand.id);
      }),
    );
  }
  loadProducts() {
    this.productList$ = this.productService.getProducts();
  }
  loadBrands() {
    this.brandList$ = this.brandService.getBrands();
  }
  setActive(brand: BrandType) {
    this.selectedBrand = brand;
    this.selectedBrand$.next(brand);
  }
  showAll() {
    this.selectedBrand = undefined;
    this.selectedBrand$.next(null);
  }
}

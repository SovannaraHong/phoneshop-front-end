import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductHistoryImport } from './product-history-import';

describe('ProductHistoryImport', () => {
  let component: ProductHistoryImport;
  let fixture: ComponentFixture<ProductHistoryImport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductHistoryImport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductHistoryImport);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

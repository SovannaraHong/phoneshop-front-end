import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportProductForm } from './import-product-form';

describe('ImportProductForm', () => {
  let component: ImportProductForm;
  let fixture: ComponentFixture<ImportProductForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportProductForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportProductForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

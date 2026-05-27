import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutOfStock } from './out-of-stock';

describe('OutOfStock', () => {
  let component: OutOfStock;
  let fixture: ComponentFixture<OutOfStock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutOfStock]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutOfStock);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

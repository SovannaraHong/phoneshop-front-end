import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BakongPayment } from './bakong-payment';

describe('BakongPayment', () => {
  let component: BakongPayment;
  let fixture: ComponentFixture<BakongPayment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BakongPayment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BakongPayment);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

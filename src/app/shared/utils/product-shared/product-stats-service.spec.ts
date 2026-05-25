import { TestBed } from '@angular/core/testing';

import { ProductStatsService } from './product-stats-service';

describe('ProductStatsService', () => {
  let service: ProductStatsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductStatsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

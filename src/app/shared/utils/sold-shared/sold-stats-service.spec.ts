import { TestBed } from '@angular/core/testing';

import { SoldStatsService } from './sold-stats-service';

describe('SoldStatsService', () => {
  let service: SoldStatsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SoldStatsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

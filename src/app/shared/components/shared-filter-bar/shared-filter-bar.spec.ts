import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedFilterBar } from './shared-filter-bar';

describe('SharedFilterBar', () => {
  let component: SharedFilterBar;
  let fixture: ComponentFixture<SharedFilterBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedFilterBar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SharedFilterBar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

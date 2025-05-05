import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorarioscostosComponent } from './horarioscostos.component';

describe('HorarioscostosComponent', () => {
  let component: HorarioscostosComponent;
  let fixture: ComponentFixture<HorarioscostosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorarioscostosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HorarioscostosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

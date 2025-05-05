import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UndeporteComponent } from './undeporte.component';

describe('UndeporteComponent', () => {
  let component: UndeporteComponent;
  let fixture: ComponentFixture<UndeporteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UndeporteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UndeporteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

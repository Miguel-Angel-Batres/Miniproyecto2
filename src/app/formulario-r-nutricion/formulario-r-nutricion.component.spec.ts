import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioRNutricionComponent } from './formulario-r-nutricion.component';

describe('FormularioRNutricionComponent', () => {
  let component: FormularioRNutricionComponent;
  let fixture: ComponentFixture<FormularioRNutricionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioRNutricionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioRNutricionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { PlanDieta } from '../models/dieta.model';
import {UsuarioService } from '../shared/usuario.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-formulario-r-nutricion',
  standalone:true,
  imports: [ReactiveFormsModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatRadioModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,],
  templateUrl: './formulario-r-nutricion.component.html',
  styleUrls: ['./formulario-r-nutricion.component.css'], 
})
export class FormularioRNutricionComponent {
  formulario: FormGroup;

  objetivos = ['Bajar de peso', 'Subir de peso'];
  deportes = ['Zumba', 'Spinning', 'Pilates', 'Yoga', 'Body Pump', 'CrossFit','Boxeo','Kickboxing'];
  alimentos = ['Manzana', 'Pollo', 'Avena', 'Verduras', 'Huevo', 'Pescado',];
  usuario: any;

  constructor(private fb: FormBuilder,private nutricionService: UsuarioService,private router: Router) {
   
    this.formulario = this.fb.group(
      {
      objetivo: ['', Validators.required],
      sexo: ['', Validators.required],
      peso: ['', [Validators.required, Validators.min(30), Validators.max(200)]],
      altura: ['', [Validators.required, Validators.min(130), Validators.max(250)]],
      deportes: ['', Validators.required],
      alimentos: this.fb.group(
        this.alimentos.reduce((acc, alimento) => {
        acc[alimento] = [false];
        return acc;
        }, {} as any)
      ),
      fechaInicio: [null, Validators.required],
      fechaFin: [null, Validators.required],
      usuario: [''] 
      },
      { validators: this.validarFechas }
    );
  }

validarFechas(group: AbstractControl): ValidationErrors | null {
  const inicioControl = group.get('fechaInicio');
  const finControl = group.get('fechaFin');

  if (!inicioControl || !finControl) return null;

  const inicio = inicioControl.value;
  const fin = finControl.value;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  // Limpiar errores previos antes de volver a validar
  inicioControl.setErrors(null);
  finControl.setErrors(null);

  if (!inicio || !fin) return null;

  const fechaInicio = new Date(inicio);
  const fechaFin = new Date(fin);

  let errores = false;

  if (fechaInicio < hoy) {
    inicioControl.setErrors({ fechaInicioPasada: true });
    errores = true;
  }

  if (fechaFin < fechaInicio) {
    finControl.setErrors({ fechaFinInvalida: true });
    errores = true;
  }

  return errores ? { fechasInvalidas: true } : null;
}

get erroresFechas() {
  return this.formulario.errors;
}
ngOnInit() {
  this.nutricionService.user.subscribe((usuario) => {
    this.usuario = usuario;
    if (!this.usuario) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso denegado',
        text: 'Debes iniciar sesión para acceder a esta sección.',
      });
      this.router.navigate(['/login']);
    }
  });
}

  enviar() {

    const valores = this.formulario.value;
    const alimentosSeleccionados = Object.entries(valores.alimentos)
      .filter(([_, seleccionado]) => seleccionado)
      .map(([alimento]) => alimento);

       
   
    const datos: PlanDieta = {
      objetivo: valores.objetivo,
      sexo: valores.sexo,
      peso: valores.peso,
      altura: valores.altura,
      deportes: valores.deportes,
      alimentos: alimentosSeleccionados,
      fechaInicio: valores.fechaInicio,
      fechaFin: valores.fechaFin,
      usuario: this.usuario ? this.usuario.uid : 'Usuario no autenticado'
    };
    this.nutricionService.guardarDatosNutricion(datos)
    .then(() => {
      Swal.fire({
        icon: 'success',
        title: 'Guardado en Firebase',
        text: 'Datos nutricionales almacenados correctamente'
      });
      this.formulario.reset();
    })
    .catch((error) => {
      console.error('Error al guardar:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron guardar los datos'
      });
    });

    /*console.log('Formulario válido:', resultado);
    Swal.fire({
      icon: 'success',
      title: 'Registro exitoso',
      text: 'Datos enviados correctamente',
    });*/

    this.formulario.reset()
    this.formulario.markAsUntouched();
  }
}

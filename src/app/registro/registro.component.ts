import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css',
})
export class RegistroComponent {
  registroForm: FormGroup;
  today = new Date().toISOString().split('T')[0];

  horariosDisponibles = ['Mañana', 'Tarde', 'Noche'];
  intereses = ['Pesas', 'Cardio', 'Yoga'];

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.registroForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      fechaNacimiento: ['', [Validators.required, this.validarFecha]],
      contraseña: ['', [Validators.required, Validators.minLength(6)]],
      horario: ['', Validators.required],
      intereses: this.fb.group({
        pesas: [false],
        cardio: [false],
        yoga: [false],
      }),
      genero: ['', Validators.required],
      imagenPerfil: [''],
      fechaRegistro: [this.today],
      plan: this.fb.group({
        nombre: [''],
        precio: [0],
        periodo: [''],
        beneficios: this.fb.array([]),
        fechaInicio: [''],
        fechaFin: [''],
        estado: [''],
      }),
      pagos: this.fb.array([]),
      rol: ['usuario'],
    });
  }

  validarFecha(control: any) {
    const inputDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return inputDate > today ? { fechaInvalida: true } : null;
  }

  get interesesSeleccionados() {
    const intereses = this.registroForm.get('intereses')?.value;
    return Object.values(intereses).some(val => val);
  }

  onSubmit() {
    if (this.registroForm.valid && this.interesesSeleccionados) {
      const nuevoUsuario = this.registroForm.value;
      const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');

      const yaExiste = usuarios.some((u: any) => u.correo === nuevoUsuario.correo);

      if (yaExiste) {
        Swal.fire({
          icon: 'error',
          title: 'Correo duplicado',
          text: 'Ya existe un usuario con ese correo.',
        });
      } else {
        usuarios.push(nuevoUsuario);
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        Swal.fire({
          icon: 'success',
          title: '¡Registro exitoso!',
          text: 'Tu información ha sido guardada.',
        }).then(() => {
          this.registroForm.reset();
          this.router.navigate(['/login']);
        });
      }
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Completa todos los campos correctamente.',
      });
    }
  }

onFileChange(event: any) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      this.registroForm.patchValue({ imagenPerfil: reader.result }); 
      localStorage.setItem('imagenPerfil', reader.result as string); 
    };
    reader.readAsDataURL(file);
  }
}
}

import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, ValidatorFn, AbstractControl, ValidationErrors} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
// Angular Material 
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { UsuarioService } from '../shared/usuario.service';




@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatRadioModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css',
})
export class RegistroComponent {
  registroForm: FormGroup;
  today = new Date().toISOString().split('T')[0];
  minDate = new Date(new Date().getFullYear() - 150, new Date().getMonth(), new Date().getDate());


  horariosDisponibles = ['Mañana', 'Tarde', 'Noche'];
  intereses = ['Pesas', 'Cardio', 'Yoga'];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private usuarioService: UsuarioService
  ) {
    this.registroForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      fechaNacimiento: ['', [Validators.required, this.validarFecha]],
      contraseña: ['', [Validators.required, Validators.minLength(6),Validators.pattern(/^(?=.*[A-Z])(?=.*\d)[A-Za-z\d_]+$/)],
    ],
      confirmarContraseña: ['', [Validators.required, this.validarConfirmacionContraseña()] ],
      horario: ['', Validators.required],
      intereses: this.fb.group({
        pesas: [false],
        cardio: [false],
        yoga: [false],
      }, { validators: this.validarIntereses() }),
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
 
  validarConfirmacionContraseña(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.parent) {
        return null;
      }
  
      const contraseña = control.parent.get('contraseña')?.value;
      const confirmarContraseña = control.value;
  
    if (!contraseña || !confirmarContraseña) {
      return null;
    }

    if (contraseña !== confirmarContraseña) {
      return { isValid: false };
    }
    return null;
  };
}
validarIntereses(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const intereses = control.value;
    const algunoSeleccionado = Object.values(intereses).some((valor) => valor === true);

    return algunoSeleccionado ? null : { noInteresSeleccionado: true };
  };
}

  
validarFecha(control: any) {
  const inputDate = new Date(control.value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const minDate = new Date(today.getFullYear() - 150, today.getMonth(), today.getDate());

  if (inputDate > today) {
    return { fechaFutura: true };
  }
  if (inputDate < minDate) {
    return { fechaMuyAntigua: true };
  }
  return null;
}

  get interesesSeleccionados() {
    const intereses = this.registroForm.get('intereses')?.value;
    return Object.values(intereses).some(val => val);
  }

  
async onSubmit() {
  if(this.registroForm.invalid && !this.interesesSeleccionados && this.registroForm.get('contraseña')?.value !== this.registroForm.get('confirmarContraseña')?.value){
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Por favor completa todos los campos requeridos.',
    });
    return;
  }else{
    const formData = this.registroForm.value;
    delete formData.confirmarContraseña;
    const dataExtra = { ...formData };
    delete dataExtra.correo;
    delete dataExtra.contraseña;

    const reg = await this.usuarioService.registrarUsuario(formData.correo, formData.contraseña, dataExtra);
    if (reg) {
      Swal.fire({
        icon: 'success',
        title: 'Registro exitoso',
        text: 'Usuario registrado correctamente.',
      });
      this.router.navigate(['/login']);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El correo ya está registrado.',
      });
    }
  }
}

onFileChange(event: any) {
  const file = event.target.files[0];
  if (file) {
    if (file.size > 1024 * 1024) { // 1 MB
      Swal.fire({
        icon: 'error',
        title: 'Archivo demasiado grande',
        text: 'El archivo es demasiado grande. Selecciona una imagen menor a 1 MB.',
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.registroForm.patchValue({ imagenPerfil: reader.result });
      localStorage.setItem('imagenPerfil', reader.result as string);
    };
    reader.readAsDataURL(file);
  }
}
}

import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuarioService } from '../shared/usuario.service';
import Swal from 'sweetalert2';

//material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
imports: [
  ReactiveFormsModule,
  RouterModule,
  MatFormFieldModule,
  MatInputModule,
  MatButtonModule
],  standalone: true
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private usuarioService: UsuarioService
  ) {
    this.loginForm = this.fb.group({
      correo: ['',Validators.required],
      contraseña: ['', [Validators.required]]
    });
   
  }

async onSubmit() {
  if (this.loginForm.invalid) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Por favor, completa todos los campos requeridos.',
    });
    return;
  }else{
    const log = await this.usuarioService.login(this.loginForm.value.correo, this.loginForm.value.contraseña);
    if (log) {
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Has iniciado sesión correctamente.',
      });
    }
    else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Usuario o contraseña incorrectos.',
      });
    }
  }
}
  
}

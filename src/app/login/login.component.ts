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
      email: ['',Validators.required],
      contraseña: ['', [Validators.required]]
    });
  }

async onSubmit() {
  if (this.loginForm.valid) {
    const { email, contraseña } = this.loginForm.value;

    const log = await this.usuarioService.login( email, contraseña );
    
    if(log.success){
      Swal.fire({
        icon: 'success',
        title: 'Bienvenido',
        text: 'Has iniciado sesión correctamente',
        showConfirmButton: false,
        timer: 1500
      });
      this.router.navigate(['/inicio']);
    }else{
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo iniciar sesión, verifica tus credenciales',
        showConfirmButton: false,
        timer: 1500
      });
    }
   
  }
}
  
}

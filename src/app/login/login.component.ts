import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuarioService } from '../shared/usuario.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [ReactiveFormsModule, RouterModule],
  standalone: true
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private usuarioService: UsuarioService
  ) {
    this.loginForm = this.fb.group({
      nombre: ['',Validators.required],
      contraseña: ['', [Validators.required]]
    });
  }
  onSubmit() {
    if (this.loginForm.valid) {
      const { nombre, contraseña } = this.loginForm.value;
  
      const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
      const usuarioValido = usuarios.find(
        (u: any) => u.nombre === nombre && u.contraseña === contraseña
      );
  
      if (usuarioValido) {
        this.usuarioService.login(usuarioValido);
        console.log('Login correcto:', usuarioValido);      
      } else {
        alert('Correo o contraseña incorrectos');
      }
    }
  }
  
}

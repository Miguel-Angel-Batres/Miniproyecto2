import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../shared/auth.service'; // Ajusta la ruta si es necesario

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
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      nombre: ['',Validators.required],
      password: ['', [Validators.required]]
    });
  }
  onSubmit() {
    if (this.loginForm.valid) {
      const { nombre, password } = this.loginForm.value;
  
      const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
      const usuarioValido = usuarios.find(
        (u: any) => u.nombre === nombre && u.contraseña === password
      );
  
      if (usuarioValido) {
        this.authService.login(usuarioValido);
        console.log('Login correcto:', usuarioValido);
        this.router.navigate(['/perfil']);
      } else {
        alert('Correo o contraseña incorrectos');
      }
    }
  }
  
}

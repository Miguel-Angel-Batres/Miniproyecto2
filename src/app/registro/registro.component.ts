import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../shared/auth.service'; // Asegúrate de importar bien la ruta
import { Router } from '@angular/router';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css',
})
export class RegistroComponent {
  registroForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.registroForm = this.fb.group({
      nombre: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
      contraseña: ['', [Validators.required, Validators.minLength(6)]]
    });
    
  }

  onSubmit() {
    if (this.registroForm.valid) {
      const nuevoUsuario = this.registroForm.value;
  
      const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
  
      const yaExiste = usuarios.some((u: any) => u.correo === nuevoUsuario.correo);
  
      if (yaExiste) {
        alert('Ya existe un usuario con ese correo.');
      } else {
        usuarios.push(nuevoUsuario);
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        alert('Registro guardado con éxito!');
        this.registroForm.reset();
        this.router.navigate(['/login']);
      }
    } else {
      alert('Por favor, complete todos los campos correctamente.');
    }
  }
  
}

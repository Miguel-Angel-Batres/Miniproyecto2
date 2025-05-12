import { Component } from '@angular/core';
import { Router, RouterModule,RouterOutlet } from '@angular/router';
import { InicioComponent } from './inicio/inicio.component';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, InicioComponent, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'miniII';

  constructor(private router: Router) {
    const usuariosAdmin = [
      {
        nombre: 'Admin1',
        correo: 'admin1@ejemplo.com',
        telefono: '1234567890',
        fechaNacimiento: '1985-06-15',
        contraseña: 'admin1',
        horario: '9:00 AM - 5:00 PM',
        intereses: { pesas: false, cardio: false, yoga: false },
        genero: 'Masculino',
        imagenPerfil: 'admin1.jpg',
        fechaRegistro: new Date(),
        rol: 'admin',
        plan: null,  
        pagos: [],  
      },
      {
        nombre: 'Admin2',
        correo: 'admin2@ejemplo.com',
        telefono: '0987654321',
        fechaNacimiento: '1990-02-20',
        contraseña: 'admin2',
        horario: '10:00 AM - 6:00 PM',
        intereses: { pesas: true, cardio: true, yoga: false },
        genero: 'Femenino',
        imagenPerfil: 'admin2.jpg',
        fechaRegistro: new Date(),
        rol: 'admin',
        plan: null,
        pagos: [],   
      },
      {
        nombre: 'Admin3',
        correo: 'admin3@ejemplo.com',
        telefono: '1122334455',
        fechaNacimiento: '1980-11-11',
        contraseña: 'admin3',
        horario: '8:00 AM - 4:00 PM',
        intereses: { pesas: true, cardio: false, yoga: true },
        genero: 'Masculino',
        imagenPerfil: 'admin3.jpg',
        fechaRegistro: new Date(),
        rol: 'admin',
        plan: null,  
        pagos: [],  
      },
    ];

    // eliminar usuariosAdmin del local storage
    const usuariosExistentes = JSON.parse(localStorage.getItem('usuarios') || '[]');
   
    // Verificar si ya existen usuarios en el local storage
    const adminsExistentes = usuariosExistentes.filter((usuario: any) => usuario.rol === 'admin');
    if (adminsExistentes.length === 0) {
      localStorage.setItem('usuarios', JSON.stringify([...usuariosExistentes, ...usuariosAdmin]));
    }
    
    
  }

  
}

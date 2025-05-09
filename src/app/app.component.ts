import { Component } from '@angular/core';
import { Router, RouterModule,RouterOutlet } from '@angular/router';
import { InicioComponent } from './inicio/inicio.component';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';
// importar usuario service
import { UsuarioService } from './shared/usuario.service';

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
        nombre: 'Admin 1',
        correo: 'admin1@ejemplo.com',
        telefono: '1234567890',
        fechaNacimiento: '1985-06-15',
        contraseña: 'admin123',
        horario: '9:00 AM - 5:00 PM',
        intereses: { pesas: false, cardio: false, yoga: false },
        genero: 'Masculino',
        imagenPerfil: 'admin1.jpg',
        fechaRegistro: new Date(),
        rol: 'admin',
        plan: null,  // Sin plan
        pagos: [],   // Sin pagos
      },
      {
        nombre: 'Admin 2',
        correo: 'admin2@ejemplo.com',
        telefono: '0987654321',
        fechaNacimiento: '1990-02-20',
        contraseña: 'admin456',
        horario: '10:00 AM - 6:00 PM',
        intereses: { pesas: true, cardio: true, yoga: false },
        genero: 'Femenino',
        imagenPerfil: 'admin2.jpg',
        fechaRegistro: new Date(),
        rol: 'admin',
        plan: null,  // Sin plan
        pagos: [],   // Sin pagos
      },
      {
        nombre: 'Admin 3',
        correo: 'admin3@ejemplo.com',
        telefono: '1122334455',
        fechaNacimiento: '1980-11-11',
        contraseña: 'admin789',
        horario: '8:00 AM - 4:00 PM',
        intereses: { pesas: true, cardio: false, yoga: true },
        genero: 'Masculino',
        imagenPerfil: 'admin3.jpg',
        fechaRegistro: new Date(),
        rol: 'admin',
        plan: null,  // Sin plan
        pagos: [],   // Sin pagos
      },
    ];

    // comprobar si los admins ya existen
    const usuariosExistentes = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const adminsExistentes = usuariosExistentes.filter((usuario: any) => usuario.rol === 'admin');
    if (adminsExistentes.length === 0) {
      // Si no existen, guardarlos en el localStorage
      localStorage.setItem('usuarios', JSON.stringify([...usuariosExistentes, ...usuariosAdmin]));
    }
    
    
  }

  
}

import { Component, OnInit } from '@angular/core';
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
export class AppComponent implements OnInit {
  title = 'miniII';
  usuarios: any[] = [];
  pagos: any[] = [];
  planes: any[] = [];
  constructor(private router: Router) {
    const usuariosAdmin = [
      {
        nombre: 'admin1',
        correo: 'admin1@ejemplo.com',
        telefono: '1234567890',
        fechaNacimiento: '1985-06-15',
        contraseña: 'admin1',
        horario: '9:00 AM - 5:00 PM',
        intereses: { pesas: false, cardio: false, yoga: false },
        genero: 'Masculino',
        imagenPerfil: 'assets/admin1.jpg',
        fechaRegistro: new Date(),
        rol: 'admin',
        plan: null,  
        pagos: [],  
      },
      {
        nombre: 'admin2',
        correo: 'admin2@ejemplo.com',
        telefono: '0987654321',
        fechaNacimiento: '1990-02-20',
        contraseña: 'admin2',
        horario: '10:00 AM - 6:00 PM',
        intereses: { pesas: true, cardio: true, yoga: false },
        genero: 'Femenino',
        imagenPerfil: 'assets/admin2.jpg',
        fechaRegistro: new Date(),
        rol: 'admin',
        plan: null,
        pagos: [],   
      },
      {
        nombre: 'admin3',
        correo: 'admin3@ejemplo.com',
        telefono: '1122334455',
        fechaNacimiento: '1980-11-11',
        contraseña: 'admin3',
        horario: '8:00 AM - 4:00 PM',
        intereses: { pesas: true, cardio: false, yoga: true },
        genero: 'Masculino',
        imagenPerfil: 'assets/admin3.jpg',
        fechaRegistro: new Date(),
        rol: 'admin',
        plan: null,  
        pagos: [],  
      },
    ];
   

      if (!localStorage.getItem('usuariosAgregados')) {
      // Añadir usuariosAdmin al local storage
      localStorage.setItem('usuarios', JSON.stringify(usuariosAdmin));
    
      
      



      // Añadir usuarios de assets/usuarios.json solo una vez
      fetch('assets/usuarios.json')
        .then(response => response.json())
        .then(data => {
          const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
          const usuariosFiltrados = data.filter((usuario: any) => !usuarios.some((u: any) => u.correo === usuario.correo));
          const usuariosCombinados = [...usuarios, ...usuariosFiltrados];
          localStorage.setItem('usuarios', JSON.stringify(usuariosCombinados));
    
          // Cargar planes desde localStorage
          this.planes = JSON.parse(localStorage.getItem('planes') || '[]');
    
          // Asignar planes a los usuarios (excepto admins)
          const usuariosActualizados = usuariosCombinados.map(usuario => {
            if (usuario.rol === 'admin') return usuario; // Excluir admins
    
            const planBase = this.planes[Math.floor(Math.random() * this.planes.length)];
            const fechaInicio = new Date().toISOString().split('T')[0];
            const fechaFin = this.getFechaFin(fechaInicio);
    
            return {
              ...usuario,
              plan: {
                ...planBase,
                fechaInicio,
                fechaFin,
                estado: 'Vencido',
              }
            };
          });
    
          // Guardar usuarios actualizados y marcar como agregados
          localStorage.setItem('usuarios', JSON.stringify(usuariosActualizados));
          this.usuarios = usuariosActualizados;
          localStorage.setItem('usuariosAgregados', 'true');
        })
        .catch(error => console.error('Error al cargar el archivo JSON:', error));
    
      // Pagos (puedes dejarlo igual)
      fetch('assets/pagos.json')
        .then(response => response.json())
        .then(data => {
          const pagos = JSON.parse(localStorage.getItem('pagos') || '[]');
          const pagosFiltrados = data.filter((pago: any) => !pagos.some((p: any) => p.titular === pago.titular));
          localStorage.setItem('pagos', JSON.stringify([...pagos, ...pagosFiltrados]));
          this.pagos = JSON.parse(localStorage.getItem('pagos') || '[]');
        })
        .catch(error => console.error('Error al cargar el archivo JSON:', error));
    }
  }

    ngOnInit(){
      
    }
     getFechaFin(fechaInicio: string): string {
    const inicio = new Date(fechaInicio);
    const meses = Math.floor(Math.random() * 3) + 1; // 1 a 3 meses
    inicio.setMonth(inicio.getMonth() + meses);
    return inicio.toISOString().split('T')[0];
  }
   planesGimnasio = [
    {
      nombre: "Básico",
      precio: 99.99,
      descripcion: "Plan básico para quienes buscan un entrenamiento sencillo y efectivo.",
      tipoPago: "mensual",
      beneficios: [
        "Acceso a área de pesas",
        "Acceso a cardio",
        "Horario limitado (6AM - 8PM)",
        "2 clases grupales por semana",
        "Casillero estándar"
      ]
    },
    {
      nombre: "Pro",
      precio: 199.99,
      descripcion: "Plan premium para quienes buscan un entrenamiento completo y personalizado.",
      tipoPago: "mensual",
      beneficios: [
        "Todas las áreas del gimnasio",
        "Clases ilimitadas",
        "1 sesión mensual con entrenador",
        "Casillero premium",
        "Acceso a sauna y spa",
        "Estacionamiento gratuito"
      ]
    },
    {
      nombre: "Exclusivo",
      precio: 299.99,
      descripcion: "Plan exclusivo para tener acceso a cualquier clase de forma completa",
      tipoPago: "mensual",
      beneficios: [
        "Acceso ilimitado a todas las áreas del gimnasio",
        "Clases grupales ilimitadas",
        "Sesiones semanales con entrenador personal",
        "Estacionamiento VIP",
        "Acceso 24/7",
        "Bebidas energéticas y toallas incluidas"
      ]
    }
  ];
  }




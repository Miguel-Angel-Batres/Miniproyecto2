import { Component, OnInit } from '@angular/core';
import { UsuarioService } from '../shared/usuario.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-perfil-admin',
  templateUrl: './perfil-admin.component.html',
  styleUrls: ['./perfil-admin.component.css'],
  standalone: true,
  imports: []
})
export class PerfilAdminComponent implements OnInit {
  usuario: any = null;

  constructor(
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.usuarioService.user.subscribe(user => {
      this.usuario = user;
    });
  }

  logout(): void {
    this.usuarioService.logout();
    this.router.navigate(['/inicio']);
  }

  editarPerfil(): void {
    console.log('Editar perfil');
    // this.router.navigate(['/editar-perfil']); // Asegúrate de tener esta ruta
  }

  gestionarUsuarios(): void {
    console.log('Ir a gestión de usuarios');
    // this.router.navigate(['/admin/usuarios']);
  }

  gestionarPagos(): void {
    console.log('Ir a gestión de pagos');
    // this.router.navigate(['/admin/pagos']);
  }

  verPlanes(): void {
    console.log('Ir a planes');
    // this.router.navigate(['/admin/planes']);
  }

  verEstadisticas(): void {
    console.log('Ir a estadísticas');
    // this.router.navigate(['/admin/estadisticas']);
  }
}

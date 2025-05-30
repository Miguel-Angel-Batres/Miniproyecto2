import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
// usuario service
import { UsuarioService } from '../shared/usuario.service';
import { PagoService } from '../pagosServicio/pagos.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css'],
})
export class PerfilComponent implements OnInit {
  usuario: any = null;
  pagos: any[] = [];
  today: string;
  user: any;
  contratado:any;
  pagoActivo:any

  constructor(private route: Router, private usuarioService: UsuarioService, private pagoService :PagoService) {
    this.today = new Date().toISOString().split('T')[0];
  }
  ngOnInit(): void {
    this.usuarioService.user.subscribe((user) => {
      this.usuario = user;
  
      if (this.usuario?.fechaNacimiento?.seconds) {
        this.usuario.fechaNacimiento = new Date(this.usuario.fechaNacimiento.seconds * 1000);
      }
  
      if (this.usuario?.nombre) {
        this.pagoService.obtenerPagosUsuario(this.usuario.nombre).subscribe((pagos) => {
          this.pagos = pagos;
          console.log(this.pagos);
  
          if (this.pagos.length > 0) {
            // Ordenar por fecha (de más reciente a más antigua)
            const pagosOrdenados = [...this.pagos].sort((a, b) => {
              const fechaA = (a.fechaPago as any).seconds
                ? new Date(a.fechaPago.seconds * 1000)
                : new Date(a.fechaPago);
              const fechaB = (b.fechaPago as any).seconds
                ? new Date(b.fechaPago.seconds * 1000)
                : new Date(b.fechaPago);
              return fechaB.getTime() - fechaA.getTime();
            });
  
            const ultimoPago = pagosOrdenados[0];
            const fechaUltimoPago = (ultimoPago.fechaPago as any).seconds
              ? new Date(ultimoPago.fechaPago.seconds * 1000)
              : new Date(ultimoPago.fechaPago);
            const hoy = new Date();
            const diferenciaEnMs = hoy.getTime() - fechaUltimoPago.getTime();
            const diasPasados = diferenciaEnMs / (1000 * 60 * 60 * 24);
  
            if (diasPasados <= 30) {
              this.pagoActivo=ultimoPago
              console.log('El usuario está ACTIVO');
              this.contratado=true;
            } else {
              console.log('El usuario está INACTIVO');
              this.contratado=false;
            }
          } else {
            console.log('El usuario no tiene pagos registrados');
          }
        });
      }
    });
  }
  

  renovarMembresia() {
    // redirigir a la pagina de pago
    this.route.navigate(['/pagos']);
  }
  cancelarMembresia() {
    // alert con sweetalert2
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Quieres cancelar tu membresía?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        // Lógica para cancelar la membresía
        this.usuario.plan.estado = 'Cancelado';
        this.usuario.plan.fechaFin = this.today;
        this.usuarioService.actualizarUsuario(this.usuario);

        Swal.fire('Cancelada!', 'Tu membresía ha sido cancelada.', 'success');
        // Actualizar pagina
        window.location.reload();
      }
    });
  }
  async vincularGoogle() {
    try {
      await this.usuarioService.vincularConGoogle();
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Cuenta de Google vinculada correctamente.',
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo vincular la cuenta de Google.',
      });
    }
  }
  
 
}

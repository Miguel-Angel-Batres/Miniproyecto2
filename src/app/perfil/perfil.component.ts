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
  planUsuario: any;
  editarfoto: boolean | undefined;

  constructor(private route: Router, private usuarioService: UsuarioService, private pagoService :PagoService) {
    this.today = new Date().toISOString().split('T')[0];
  }
  ngOnInit(): void {
    this.usuarioService.user.subscribe((user) => {
      this.usuario = user;

      if(this.usuario?.nombre){
        this.planUsuario = this.usuarioService.obtenerPlan(this.usuario.plan.nombre).then((plan) => {
          this.planUsuario = plan;
        }
        ).catch((error) => {
          console.error('Error al obtener el plan del usuario:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo obtener el plan del usuario.',
          });
        }
        );
      }

      if (this.usuario?.fechaNacimiento?.seconds) {
        this.usuario.fechaNacimiento = new Date(this.usuario.fechaNacimiento.seconds * 1000);
      }
      if (this.usuario?.plan?.fechaInicio) {
        this.usuario.plan.fechaInicio = this.convertirFecha(this.usuario.plan.fechaInicio);
      }
      if (this.usuario?.plan?.fechaFin) {
        this.usuario.plan.fechaFin = this.convertirFecha(this.usuario.plan.fechaFin);
      }
  
      if (this.usuario?.pagos?.length > 0) {
        this.pagoService.obtenerPagosPorIds(this.usuario.pagos).then((pagos) => {
          this.pagos = pagos;
          if (this.pagos.length > 0) {
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
              this.pagoActivo = ultimoPago;
              this.contratado = true;
            } else {
              this.contratado = false;
            }
          } else {
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
  cambiarImagen(event: any) {
    const file = event.target.files[0];
    if (!file) {
      console.warn('No se seleccionó ningún archivo.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        this.usuario.imagenPerfil = e.target.result;
        this.usuarioService.actualizarfotoPerfil(this.usuario.uid, this.usuario.imagenPerfil).then
          (() => {
            Swal.fire({
              icon: 'success',
              title: 'Éxito',
              text: 'Foto de perfil actualizada correctamente.',
            });
            this.editarfoto = false;
          })
          .catch((error) => {
            console.error('Error al actualizar la foto de perfil:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo actualizar la foto de perfil.',
            });
          });
      } catch (error) {
        console.error('Error al procesar la imagen:', error);
      }
    };

   
    reader.readAsDataURL(file);
  }
  activarEdicionFoto() {
    this.editarfoto = true;
  }
  convertirFecha(fecha: any): Date | null {
    if (fecha?.seconds) {
      return new Date(fecha.seconds * 1000);
    } else if (typeof fecha === 'string') {
      return new Date(fecha);
    } else if (fecha instanceof Date) {
      return fecha;
    }
    return null;
  }
 
}

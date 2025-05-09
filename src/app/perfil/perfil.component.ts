import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
// usuario service
import { UsuarioService } from '../shared/usuario.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule,FormsModule,RouterModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  usuario: any = null;
  
  pagos: any[] = [];
 
  today: string;

  constructor(private route: Router, private usuarioService: UsuarioService) {
    this.today = new Date().toISOString().split('T')[0];
  }

  ngOnInit(): void {
    
      this.usuario = this.usuarioService.obtenerUsuarioLogeado();
        
      if(this.usuario.plan.nombre !== ''){
        if (this.usuario.plan.fechaFin < this.today) {
          this.usuario.plan.estado = 'Vencido';
          this.usuarioService.actualizarUsuario(this.usuario);
      }}
      this.pagos = this.usuarioService.obtenerPagosUsuario();

    
    
  }
  renovarMembresia() {
      // redirigir a la pagina de pago
      this.route.navigate(['/pagos']);
  }
  cancelarMembresia() {
    // alert con sweetalert2
    Swal.fire({
      title: '¿Estás seguro?',
      text: "¿Quieres cancelar tu membresía?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Lógica para cancelar la membresía
        this.usuario.plan.estado = 'Cancelado';
        this.usuario.plan.fechaFin = this.today;
        this.usuarioService.actualizarUsuario(this.usuario);

        Swal.fire(
          'Cancelada!',
          'Tu membresía ha sido cancelada.',
          'success'
        )
        // Actualizar pagina 
        window.location.reload();
      }
    }) 
  }

}

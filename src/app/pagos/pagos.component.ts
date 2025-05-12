import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Pago } from '../models/pago.model'; 
import { CommonModule } from '@angular/common';
// servicio de usuario
import { UsuarioService } from '../shared/usuario.service';
// modelo de planes
import { PLANES } from '../models/planes.model';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pagos',
  templateUrl: './pagos.component.html',
  styleUrls: ['./pagos.component.css'],
   imports: [CommonModule, FormsModule],
})
export class PagosComponent implements OnInit {
  @ViewChild('formPago') formPago!: NgForm;

  today: string;
  planSeleccionado = JSON.parse(localStorage.getItem('planSeleccionado') || '""');
  planes: any[] = [];
  bancos = ['BBVA', 'Santander', 'Banorte', 'HSBC', 'Citibanamex'];
  bancoIcons: { [key: string]: string } = {
    BBVA: 'assets/bbva.png',
    Santander: 'assets/santander.png',
    Banorte: 'assets/banorte.png',
    HSBC: 'assets/hsbc.png',
    Citibanamex: 'assets/citibanamex.png'
  };

  pago: Pago = {
    titular: '',
    tarjeta: '',
    fechaPago: '',
    metodo: '',
    banco: '',
    terminos: false,
    duracion: 1,
    monto: 0,
    plan: this.planSeleccionado,
  };
  tarjetaInvalida = false;

  metodo_marcado = true; 

  constructor(private usuarioService: UsuarioService,private route: Router) {
    const fecha = new Date();
    this.today = fecha.toISOString().split('T')[0];
    this.pago.fechaPago = this.today;
    this.planes = JSON.parse(localStorage.getItem('planes') || '[]');
  }

  ngOnInit(): void {}
  onSubmit(): void {
    if (this.formPago.valid) {
      // obtener usuario logeado
      const usuario = this.usuarioService.obtenerUsuarioLogeado();
      if (usuario) {
        usuario.plan = this.planes.find((plan) => plan.nombre === this.planSeleccionado);
        usuario.plan.fechaInicio = this.today;
        // calcular fecha fin segun duracion
        usuario.plan.fechaFin = new Date();
        usuario.plan.fechaFin.setMonth(usuario.plan.fechaFin.getMonth() + usuario.plan.duracion);
        usuario.plan.estado = 'Activo';
        this.pago.monto = usuario.plan.precio * this.pago.duracion;
        usuario.pagos.push(this.pago);
        this.usuarioService.actualizarUsuario(usuario);
        // guardar pago en local storage
        const pagos = JSON.parse(localStorage.getItem('pagos') || '[]');
        pagos.push(this.pago);
        localStorage.setItem('pagos', JSON.stringify(pagos));
        
        // mostrar mensaje de éxito con sweetalert
        Swal.fire({
          icon: 'success',
          title: 'Pago realizado con éxito',
          text: `Plan ${this.planSeleccionado} contratado`,
          confirmButtonText: 'Aceptar'
        }).then(() => {
          this.route.navigate(['/horarioscostos']);
        });
      } else {
        console.error('Usuario no encontrado');
      }
    } else {
      console.warn('Formulario inválido');
    }
  }
  
  
  cambiarPlan(): void {
    this.route.navigate(['/horarioscostos']);
  }
  
  onTarjetaInput() {
    this.tarjetaInvalida =
      this.pago.tarjeta.length === 16 && !this.luhnCheck(this.pago.tarjeta);
  }
  
  luhnCheck(numero: string): boolean {
  let sum = 0;
  let shouldDouble = false;
  for (let i = numero.length - 1; i >= 0; i--) {
    let digit = parseInt(numero.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
  }
}

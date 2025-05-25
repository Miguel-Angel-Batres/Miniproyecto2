import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Pago } from '../models/pago.model'; 
import { CommonModule } from '@angular/common';
// servicio de usuario
import { UsuarioService } from '../shared/usuario.service';
// modelo de planes
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { PagoService } from '../pagosServicio/pagos.service';

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

  constructor(private usuarioService: UsuarioService,private route: Router,private pagoServicio:PagoService) {
    const fecha = new Date();
    this.today = fecha.toISOString().split('T')[0];
    this.pago.fechaPago = this.today;
    this.planes = JSON.parse(localStorage.getItem('planes') || '[]');
  }

  ngOnInit(): void {
    this.usuarioService.user.subscribe((user) => {
      if (user) {
        this.pago.titular = user.nombre;
        this.pago.plan = user.plan;
      }
    }
    );
  }
  onSubmit(): void {
    if (this.formPago.valid) {
      this.pagoServicio.registrarPago(this.pago)
        .then(() => {
          Swal.fire({
            icon: 'success',
            title: 'Pago realizado con éxito',
            confirmButtonText: 'Aceptar'
          }).then(() => {
            this.route.navigate(['/horarioscostos']);
          });
        })
        .catch(err => {
          console.error(err);
          Swal.fire('Error', 'No se pudo guardar el pago', 'error');
        });
    } else {
      Swal.fire('Atención', 'Completa el formulario correctamente', 'warning');
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

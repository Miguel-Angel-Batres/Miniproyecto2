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


declare var paypal: any;
@Component({
  selector: 'app-pagos',
  templateUrl: './pagos.component.html',
  styleUrls: ['./pagos.component.css'],
   imports: [CommonModule, FormsModule],
})
export class PagosComponent implements OnInit {
  @ViewChild('formPago') formPago!: NgForm;

  metodoPago: 'regular' | 'paypal' = 'regular';
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
 
initPayPalButton() {
  const container = document.getElementById('paypal-button-container');
  if (container) {
    // Limpia el contenedor antes de renderizar el botón
    container.innerHTML = '';
    paypal.Buttons({
      createOrder: (data: any, actions: any) => {
        return actions.order.create({
          purchase_units: [{
            amount: { value: '99.00' }
          }]
        });
      },
      onApprove: (data: any, actions: any) => {
        return actions.order.capture().then((details: any) => {
          Swal.fire('¡Pago completado!', `Gracias, ${details.payer.name.given_name}`, 'success');
          this.pago.fechaPago = this.today;
          this.pago.metodo = 'paypal';
          this.pago.terminos = true;
          this.pago.monto = parseFloat(details.purchase_units[0].amount.value);
          this.pago.tarjeta = 'paypal';
          this.pago.banco = 'paypal';
          this.pagoServicio.registrarPago(this.pago)
            .then(() => this.route.navigate(['/horarioscostos']))
            .catch(err => {
              console.error(err);
              Swal.fire('Error', 'No se pudo guardar el pago', 'error');
            });
        });
      },
      onError: (err: any) => {
        console.error('Error en el pago:', err);
        Swal.fire('Error', 'Hubo un problema con el pago.', 'error');
      }
    }).render('#paypal-button-container');
  }
}
setMetodoPago(metodo: 'regular' | 'paypal') {
  this.metodoPago = metodo;
  if (metodo === 'paypal') {
    setTimeout(() => this.initPayPalButton(), 0); // Espera a que el DOM se actualice
  }
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

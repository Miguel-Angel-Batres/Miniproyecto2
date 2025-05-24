import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Deporte } from '../deporte';
import { DeportesService } from '../shared/deportes.service';
import { RouterModule } from '@angular/router';
import { QRCodeComponent } from 'angularx-qrcode';

@Component({
  imports: [RouterModule, QRCodeComponent],
  selector: 'app-undeporte',
  templateUrl: './undeporte.component.html',
  styleUrls: ['./undeporte.component.css']
})
export class UndeporteComponent {
  currentUrl = window.location.href;


  deporte!: Deporte; // Variable para almacenar el deporte actual

  constructor(
    private deporteService: DeportesService, // Inyección del servicio
    private activatedRoute: ActivatedRoute // Inyección de la ruta activa
  ) {
    // Suscribirse a los parámetros de la ruta para obtener el nombre
    this.activatedRoute.params.subscribe(params => {
      const nombre = params['nombre']; // Obtener el nombre del deporte desde la URL
      this.obtenerDeporte(nombre); // Llamar al método para obtener el deporte
    });
  }

  // Método para obtener un deporte por nombre
  obtenerDeporte(nombre: string): void {
    this.deporteService.getDeportes().subscribe({
      next: (deportes: Deporte[]) => {
        const deporteEncontrado = deportes.find(deporte => deporte.nombre === nombre); // Buscar el deporte por nombre
        if (deporteEncontrado) {
          this.deporte = deporteEncontrado; // Asignar el deporte encontrado
        } else {
          console.error(`No se encontró un deporte con el nombre: ${nombre}`); // Manejo si no se encuentra
        }
      },
      error: (err) => {
        console.error('Error al obtener la lista de deportes:', err); // Manejo de errores
      }
    });
  }
}
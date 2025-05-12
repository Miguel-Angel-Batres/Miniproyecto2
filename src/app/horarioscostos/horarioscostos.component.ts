import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Deporte } from '../deporte';
import { DeportesService } from '../shared/deportes.service';
import { Router } from '@angular/router';
import { UsuarioService } from '../shared/usuario.service';


@Component({
  selector: 'app-horarioscostos',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './horarioscostos.component.html',
  styleUrls: ['./horarioscostos.component.css']
})
export class HorarioscostosComponent implements OnInit {
  // datos iniciales
  usuario : any = null;
  deportes: Deporte[] = [];
  activeTab: 'horarios' | 'clases' = 'horarios';
  planes: any = null;
  
  constructor(
    private deporteService: DeportesService,
    private router: Router,
    private usuarioService: UsuarioService
  ) {
  }

  ngOnInit(): void {
    this.deporteService.getDeportes().subscribe(
      (data: Deporte[]) => {
        this.deportes = data;
      });
    this.usuarioService.user.subscribe(user => {
      this.usuario = user;
    });
    this.planes = JSON.parse(localStorage.getItem('planes') || '[]');
    if(!this.planes || this.planes.length === 0){
      this.planes = this.planesGimnasio;
      localStorage.setItem('planes', JSON.stringify(this.planes));
    }

  }

  setActiveTab(tab: 'horarios' |  'clases'): void {
    this.activeTab = tab;
  }

  pagar(plan: string): void {
    // cambiar ruta a pagos
    if(this.usuarioService.isAuthenticated()){
    this.router.navigate(['/pagos']);
    localStorage.setItem('planSeleccionado', JSON.stringify(plan)); 
    }else{
      this.router.navigate(['/login']);
    }
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

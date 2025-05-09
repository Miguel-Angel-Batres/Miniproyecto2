import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Deporte } from '../deporte';
import { DeportesService } from '../shared/deportes.service';
import { Router } from '@angular/router';
import { UsuarioService } from '../shared/usuario.service';
import { PLANES } from '../models/planes.model';


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
  activeTab: 'horarios' | 'pago' | 'pagoplus' | 'clases' = 'horarios';
  planes = PLANES;

  
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
    // agregar los planes al local storage una vez
    this.planes.forEach((plan) => {
      const planesGuardados = JSON.parse(localStorage.getItem('planes') || '[]');
      if (!planesGuardados.some((p: any) => p.nombre === plan.nombre)) {
        planesGuardados.push(plan);
      }
      localStorage.setItem('planes', JSON.stringify(planesGuardados));
    });
  }

  setActiveTab(tab: 'horarios' |  'clases'): void {
    this.activeTab = tab;
  }

  pagar(plan: string): void {
    // cambiar ruta a pagos
    if(this.usuarioService.isAuthenticated()){
    this.router.navigate(['/pagos']);
    localStorage.setItem('planSeleccionado', plan);
    }else{
      this.router.navigate(['/login']);
    }
  }
  
  
}

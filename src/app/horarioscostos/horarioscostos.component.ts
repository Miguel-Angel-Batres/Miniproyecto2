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
  activeTab: 'horarios' | 'pago' | 'pagoplus' | 'clases' = 'horarios';
  

  
  constructor(
    private deporteService: DeportesService,
    private router: Router,
    private usuarioService: UsuarioService
  ) {
    
  }

  ngOnInit(): void {
    this.deportes = this.deporteService.getDeportes();
    this.usuarioService.user.subscribe(user => {
      this.usuario = user;
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

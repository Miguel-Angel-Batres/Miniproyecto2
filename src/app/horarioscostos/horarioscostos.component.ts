import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Deporte } from '../deporte';
import { DeportesService } from '../shared/deportes.service';
import { Router } from '@angular/router';
import { UsuarioService } from '../shared/usuario.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-horarioscostos',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, MatTableModule, MatPaginatorModule],
  templateUrl: './horarioscostos.component.html',
  styleUrls: ['./horarioscostos.component.css']
})
export class HorarioscostosComponent implements OnInit{
  usuario: any = null;
  deportes: Deporte[] = [];
  activeTab: 'horarios' | 'clases' = 'horarios';
  planes: any = null;

  displayedColumns: string[] = ['clase', 'descripcion','horario'];
  dataSource = new MatTableDataSource<Deporte>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private deporteService: DeportesService,
    private router: Router,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.deporteService.getDeportes().subscribe((data: Deporte[]) => {
      this.deportes = data;
      this.dataSource.data = data;
      this.dataSource.paginator = this.paginator;
    });

    this.usuarioService.user.subscribe(user => {
      this.usuario = user;
    });

    this.planes = JSON.parse(localStorage.getItem('planes') || '[]');
  }

  

 
  setActiveTab(tab: 'horarios' | 'clases'): void {
    this.activeTab = tab;
  
    // set active style
    if (tab === 'horarios') {
      (document.querySelector('.horarios-section') as HTMLElement)!.style.display = 'block';
      (document.querySelector('.clases-section') as HTMLElement)!.style.display = 'none';
    } else {
      (document.querySelector('.horarios-section') as HTMLElement)!.style.display = 'none';
      (document.querySelector('.clases-section') as HTMLElement)!.style.display = 'block';
    }
  }

  pagar(plan: string): void {
    if (this.usuarioService.isAuthenticated() && this.usuario.rol !== 'admin') {
       if(this.usuarioService.isAuthenticated()){
        this.router.navigate(['/pagos']);
        localStorage.setItem('planSeleccionado', JSON.stringify(plan));
       }else{
        this.router.navigate(['/login']);
       }
    } else {
      this.router.navigate(['/inicio']);
    }
  }
}

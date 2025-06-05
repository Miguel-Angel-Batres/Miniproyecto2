import { Component, OnInit } from '@angular/core';
import { DeportesService } from '../shared/deportes.service';
import { Deporte } from '../deporte';
import { RouterModule } from '@angular/router';
import { SearchBarComponent } from "../search-bar/search-bar.component";
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-deportes',
  standalone: true,
  imports: [RouterModule, SearchBarComponent,MatProgressSpinnerModule],
  templateUrl: './deportes.component.html',
  styleUrls: ['./deportes.component.css']
})
export class DeportesComponent implements OnInit {
  deportes_de_api: Deporte[] = [];
  filteredDeportes: Deporte[] = []; 
  imagenCargando: { [nombre: string]: boolean } = {}; // <-- variable de carga


  constructor(private deportesService: DeportesService) {}
  ngOnInit(): void {
    this.deportesService.getDeportes().subscribe({
      next: (data) => {
        this.deportes_de_api = data;
        this.filteredDeportes = data; 
        data.forEach(deporte => this.imagenCargando[deporte.nombre] = true);

      }
    });
  }
  onSearch(query: string): void {
    this.filteredDeportes = this.deportes_de_api.filter(deporte =>
      deporte.nombre.toLowerCase().includes(query.toLowerCase())
    );
  }

}

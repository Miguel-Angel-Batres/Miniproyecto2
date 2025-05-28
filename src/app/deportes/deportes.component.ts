import { Component, OnInit } from '@angular/core';
import { DeportesService } from '../shared/deportes.service';
import { Deporte } from '../deporte';
import { RouterModule } from '@angular/router';
import { SearchBarComponent } from "../search-bar/search-bar.component";

@Component({
  selector: 'app-deportes',
  standalone: true,
  imports: [RouterModule, SearchBarComponent],
  templateUrl: './deportes.component.html',
  styleUrls: ['./deportes.component.css']
})
export class DeportesComponent implements OnInit {
  deportes_de_api: Deporte[] = [];
    filteredDeportes: Deporte[] = []; 

  constructor(private deportesService: DeportesService) {}
  ngOnInit(): void {
    this.deportesService.getDeportes().subscribe({
      next: (data) => {
        this.deportes_de_api = data;
        this.filteredDeportes = data; 
      }
    });
  }
  onSearch(query: string): void {
    this.filteredDeportes = this.deportes_de_api.filter(deporte =>
      deporte.nombre.toLowerCase().includes(query.toLowerCase())
    );
  }

}

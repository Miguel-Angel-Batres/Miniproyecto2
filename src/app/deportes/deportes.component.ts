import { Component, OnInit } from '@angular/core';
import { DeportesService } from '../shared/deportes.service';
import { Deporte } from '../deporte';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-deportes',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './deportes.component.html',
  styleUrls: ['./deportes.component.css']
})
export class DeportesComponent implements OnInit {
  deportes_de_api: Deporte[] = [];

  constructor(private deportesService: DeportesService) {}
  ngOnInit(): void {
    this.deportesService.getDeportes().subscribe({
      next: (data) => {
        this.deportes_de_api = data;
      }
    });
  }
}
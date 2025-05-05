import { Component } from '@angular/core';
import { Deporte } from '../deporte';
import { DeportesService } from '../shared/deportes.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-deportes',
  imports: [RouterModule],
  templateUrl: './deportes.component.html',
  styleUrl: './deportes.component.css'
})
export class DeportesComponent {

  misDeportes: Deporte[] = [];

  constructor(public miservicio: DeportesService) {
    console.log("Constructor DeportesComponent");
  }

  ngOnInit(): void {
    console.log("ngOnInit DeportesComponent");
    this.misDeportes = this.miservicio.getDeportes();
    console.log(this.misDeportes);
  }

}

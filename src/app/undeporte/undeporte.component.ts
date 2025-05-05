import { Component, Input } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Deporte } from '../deporte';
import { DeportesService } from '../shared/deportes.service';

@Component({
  selector: 'app-undeporte',
  imports: [RouterModule],
  templateUrl: './undeporte.component.html',
  styleUrl: './undeporte.component.css'
})
export class UndeporteComponent {
  deporte!:Deporte;

  constructor(public deporteService:DeportesService, public activatedRoute: ActivatedRoute) {
    this.activatedRoute.params.subscribe(params => {
      this.deporte = deporteService.getUnDeporte(params['id']);
    });
  }
}

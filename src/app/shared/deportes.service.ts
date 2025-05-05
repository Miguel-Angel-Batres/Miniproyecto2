import { Injectable } from '@angular/core';
import { DEPORTES } from '../misdeportes';
import { Deporte } from '../deporte';

@Injectable({
  providedIn: 'root'
})
export class DeportesService {

  private deportes: Deporte[] = DEPORTES;

  constructor() { }

  getDeportes(): Deporte[] {
    return this.deportes;
  }
  
  getUnDeporte(posicion: number): Deporte {
    return this.deportes[posicion];
  }
}

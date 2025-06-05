import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PlanDieta } from '../models/dieta.model';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class NutricionService {

  constructor(private firestore: Firestore) {}

  guardarDatosNutricion(datos: PlanDieta) {
    const nutricionRef = collection(this.firestore, 'nutricion');
    return addDoc(nutricionRef, datos);
  }
}

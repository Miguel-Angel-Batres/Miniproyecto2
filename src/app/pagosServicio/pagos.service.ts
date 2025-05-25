import { Injectable } from '@angular/core';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';  
import { Pago } from '../models/pago.model';

@Injectable({
  providedIn: 'root'
})
export class PagoService {
  async registrarPago(pago: Pago) {
    const pagosRef = collection(db, 'pagos'); 
    return await addDoc(pagosRef, {
      ...pago,
      fechaRegistro: new Date()
    });
  }
}
import { Injectable } from '@angular/core';
import { addDoc, collection, Firestore } from 'firebase/firestore';


@Injectable({
  providedIn: 'root'
})
export class PagosService {

  constructor(private firestore:Firestore) { }

  async registrarPago(pago:any):Promise<void>{
    try{
      const pagosRef=collection(this.firestore,'pagos');
      await addDoc(pagosRef,pago);
    }catch(error){
      console.error('error registradno el pago',error)
      throw error;
    }
  }

}

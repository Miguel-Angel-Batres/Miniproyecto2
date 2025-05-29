import { Injectable } from '@angular/core';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../../firebase';  
import { Pago, PagoConId } from '../models/pago.model';
import { from, Observable } from 'rxjs';


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
  obtenerPagos(): Observable<PagoConId[]> {
    const pagosRef = collection(db, 'pagos');
    const promesa = getDocs(pagosRef).then(snapshot => {
      const pagos: PagoConId[] = [];
      snapshot.forEach(doc => {
        pagos.push({ id: doc.id, ...(doc.data() as Pago) });
      });
      return pagos;
    });
  
    return from(promesa);
  }
  eliminarPago(id: string): Promise<void> {
    const pagoRef = doc(db, 'pagos', id);
    return deleteDoc(pagoRef);
  }
  obtenerPagosUsuario(nombre: string): Observable<PagoConId[]> {
    const pagosRef = collection(db, 'pagos');
    const q = query(pagosRef, where('titular', '==', nombre));
    return from(
      getDocs(q).then((snap) =>
        snap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as any),
        }))
      )
    );
  }
  
}
import { Injectable } from '@angular/core';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';  
import { Pago, PagoConId } from '../models/pago.model';
import { from, Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class PagoService {
  async registrarPago(pago: Pago) {
    const pagosRef = collection(db, 'pagos');
    
    const usuariosQuery = query(collection(db, 'usuarios'), where('nombre', '==', pago.titular));
    const usuariosSnapshot = await getDocs(usuariosQuery);
    if (usuariosSnapshot.empty) {
      throw new Error('Usuario no encontrado');
    }
    const usuarioDoc = usuariosSnapshot.docs[0];
    const usuariosRef = doc(db, 'usuarios', usuarioDoc.id);   

    const nuevoPago = await addDoc(pagosRef, {
      ...pago,
      fechaRegistro: new Date()
    });

    await updateDoc(usuariosRef, {
      pagos: arrayUnion(nuevoPago.id),
      plan: {
        nombre: pago.plan,
        estado: 'activo',
        fechaInicio: new Date(),
        fechaFin: new Date(new Date().setMonth(new Date().getMonth() + pago.duracion)),
      }
      
    });

    return nuevoPago;
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
 
   obtenerPagosPorIds(ids: string[]): Promise<any[]> {
      const promesas = ids.map((id) => {
        const pagoRef = doc(db, 'pagos', id);
        return getDoc(pagoRef).then((docSnap) => {
          if (docSnap.exists()) {
            
            return { id: docSnap.id, ...docSnap.data() };
          } else {
            console.warn(`Pago con ID ${id} no encontrado.`);
            return null;
          }
        });
      });
    
      return Promise.all(promesas).then((pagos) => pagos.filter((pago) => pago !== null));
    }
}
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc ,setDoc,getDoc} from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged} from 'firebase/auth';
import { auth, db } from '../../firebase';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly KEY = 'usuarios';
  private readonly USER_KEY = 'user';
  private userSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private route: Router) {
    const storedUser = localStorage.getItem(this.USER_KEY);
    if (storedUser) {
      this.userSubject.next(JSON.parse(storedUser));
    }
    // limpiar nulos de planes del local storage
    const planes = JSON.parse(localStorage.getItem('planes') || '[]');
    const planesFiltrados = planes.filter((plan: any) => plan !== null);
    localStorage.setItem('planes', JSON.stringify(planesFiltrados));
    
  }

  get user() {
    return this.userSubject.asObservable();
  }

  async login(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Obtener datos extra de Firestore
      const userDocRef = doc(db, 'usuarios', user.uid);
      const userDocSnap = await getDoc(userDocRef);
  
      if (!userDocSnap.exists()) {
        throw new Error('Datos de usuario no encontrados en Firestore');
      }
  
      const datosExtra = userDocSnap.data();
  
      // Combinar Auth + Firestore
      const usuarioCompleto = {
        uid: user.uid,
        email: user.email,
        ...datosExtra
      };
  
      this.userSubject.next(usuarioCompleto); // Emitimos el objeto combinado
  
      return {
        success: true,
        user: usuarioCompleto
      };
  
    } catch (error: any) {
      console.error('Error al iniciar sesión:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  isAuthenticated(): boolean {
    if(this.userSubject.value){
      return true;
    }else{
      return false;
    }
  }
  
  async registrarUsuario(email: string, password: string, datosExtra: any) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      const uid = userCredential.user.uid;
      const userRef = doc(db, 'usuarios', uid);

      await setDoc(userRef, {
        email,
        ...datosExtra,
        creadoEn: new Date()
      });

      return { success: true, uid };
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        return { success: false, error: 'El correo ya está registrado' };
      }
      return { success: false, error: error.message };
    }
  }

  async logout(){
    try {
      await auth.signOut();
      this.userSubject.next(null);
      this.route.navigate(['/login']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

    

  guardarUsuario(usuario: any): void {
    const usuarios = this.obtenerUsuarios();
    usuarios.push(usuario);
    localStorage.setItem(this.KEY, JSON.stringify(usuarios));
  }

  obtenerUsuarios(): any[] {
    return JSON.parse(localStorage.getItem(this.KEY) || '[]');
  }

  obtenerUsuarioLogeado(): any {
    const usuarioActual = this.userSubject.value;
    if (!usuarioActual) return null;
    return this.obtenerUsuarios().find(u => u.correo === usuarioActual.correo);
  }

  actualizarUsuario(usuario: any): void {
    const usuarios = this.obtenerUsuarios();
    const index = usuarios.findIndex((u: any) => u.correo === usuario.correo);
    if (index !== -1) {
      usuarios[index] = usuario;
      localStorage.setItem(this.KEY, JSON.stringify(usuarios));

      const userActual = this.userSubject.value;
      if (userActual?.correo === usuario.correo) {
        localStorage.setItem(this.USER_KEY, JSON.stringify(usuario));
        this.userSubject.next(usuario);
      }
    }
  }

  obtenerPagosUsuario(): any[] {
    const usuario = this.obtenerUsuarioLogeado();
    return usuario?.pagos || [];
  }
  eliminarUsuario(usuario: any): void{
    const usuarios = this.obtenerUsuarios();
    const user = usuarios.find(u=> u.correo === usuario.correo);
    if(user){
      const index = usuarios.indexOf(user);
      if(index !== -1){
        usuarios.splice(index, 1);
        localStorage
        .setItem(this.KEY, JSON.stringify(usuarios));
      }
    }
  }
  actualizarPlan(plan: any): void {
    const planes = JSON.parse(localStorage.getItem('planes') || '[]');
    const index = planes.findIndex((p: any) => p.nombre === plan.nombre);
    if (index !== -1) {
      planes[index] = plan;
      localStorage.setItem('planes', JSON.stringify(planes));
    }
  }
  eliminarPlan(plan: any): void {
    const planes = JSON.parse(localStorage.getItem('planes') || '[]');
    const index = planes.findIndex((p: any) => p.nombre === plan.nombre);
    if (index !== -1) {
      planes.splice(index, 1);
      localStorage.setItem('planes', JSON.stringify(planes));
    }
  }
  agregarPlan(plan: any): void {
    const planes = JSON.parse(localStorage.getItem('planes') || '[]');
    planes.push(plan);
    localStorage.setItem('planes', JSON.stringify(planes));
  }

}

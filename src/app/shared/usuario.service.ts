import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import Swal from 'sweetalert2';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, getDoc, getDocs, setDoc, collection, deleteDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private readonly USER_KEY = 'user';
  private userSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private usersSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  private pagosSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  private planesSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

  constructor(private route: Router) {
    const storedUser = localStorage.getItem(this.USER_KEY);
    if (storedUser) {
      this.userSubject.next(JSON.parse(storedUser));
    }
  }

  get user() {
    return this.userSubject.asObservable();
  }
  get users(){
    return this.usersSubject.asObservable();
  }
  get pagos(){
    return this.pagosSubject.asObservable();
  }
  get planes(){
    return this.planesSubject.asObservable();
  }

  async login(email: string, password: string): Promise<boolean> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDocRef = doc(db, 'usuarios', user.uid);
      const userSnapshot = await getDoc(userDocRef);
      if (userSnapshot.exists()) {
        const usuarioCompleto = userSnapshot.data();
        this.userSubject.next(usuarioCompleto);
        localStorage.setItem(this.USER_KEY, JSON.stringify(usuarioCompleto));
      } else {
        console.warn('No se encontró el documento del usuario en Firestore');
        this.userSubject.next(null);
      }
      return true;
    } catch (error: any) {
      console.error('Error al iniciar sesión:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Usuario o contraseña incorrectos.',
      });
      return false;
    }
  }

  async registrarUsuario(email: string, password: string, extraData: any): Promise<boolean> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const usuario = {
        ...extraData,
        uid: user.uid,
        correo: email,
        fechaRegistro: new Date().toISOString().split('T')[0],
      };

      await setDoc(doc(db, 'usuarios', user.uid), usuario);
      return true;
    } catch (error: any) {
      console.error('Error al registrar el usuario:', error);

      if (error.code === 'auth/email-already-in-use') {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'El correo ya está en uso.',
        });
      }
      return false;
    }
  }

  logout(): void {
    localStorage.removeItem(this.USER_KEY);
    this.userSubject.next(null);
  }

  isAuthenticated(): boolean {
    return this.userSubject.value !== null;
  }

  async obtenerUsuarios(): Promise<any[]> {
    try {
      const usuarios: any[] = [];
      const querySnapshot = await getDocs(collection(db, 'usuarios'));
      querySnapshot.forEach((doc) => {
        usuarios.push({ uid:doc.id , ...doc.data() });
      });
      this.usersSubject.next(usuarios);
      console.log('Usuarios obtenidos:', usuarios);
      return usuarios;
    } catch (error) {
      console.error('Error al obtener los usuarios:', error);
      return [];
    }
  }
  async obtenerPlanes(){
    try {
      const planes: any[] = [];
      const querySnapshot = await getDocs(collection(db, 'planes'));
      querySnapshot.forEach((doc) => {
        planes.push({ id:doc.id , ...doc.data() });
      });
      this.planesSubject.next(planes);
      console.log('Planes obtenidos:', planes);
      return planes;
    } catch (error) {
      console.error('Error al obtener los planes:', error);
      return [];
    }
  }

  async obtenerUsuarioLogeado(): Promise<any> {
    const usuarioActual = this.userSubject.value;
    if (!usuarioActual) return null;

    try {
      const userDocRef = doc(db, 'usuarios', usuarioActual.uid);
      const userSnapshot = await getDoc(userDocRef);
      if (userSnapshot.exists()) {
        return {...userSnapshot.data() };
      }
      return null;
    } catch (error) {
      console.error('Error al obtener el usuario logeado:', error);
      return null;
    }
  }

  async actualizarUsuario(usuario: any): Promise<void> {
    try {
      const userDocRef = doc(db, 'usuarios', usuario.uid);
      await updateDoc(userDocRef, usuario);

      const userActual = this.userSubject.value;
      if (userActual?.uid === usuario.uid) {
        this.userSubject.next(usuario);
      }
    } catch (error) {
      console.error('Error al actualizar el usuario:', error);
    }
  }

  async eliminarUsuario(uid: string): Promise<void> {
    try {
      const userDocRef = doc(db, 'usuarios', uid);
      await deleteDoc(userDocRef);
      const usuarios = this.usersSubject.value.filter((u) => u.uid !== uid);
      this.usersSubject.next(usuarios);
    } catch (error) {
      console.error('Error al eliminar el usuario:', error);
    }
  }

  async obtenerPagosUsuario(): Promise<any[]> {
    const usuario = await this.obtenerUsuarioLogeado();
    return usuario?.pagos || [];
  }
  async eliminarPlan(plan: any): Promise<void> {
    const planes = await getDocs(collection(db, 'planes'));
    planes.forEach(async (doc) => {
      if (doc.id === plan.id) {
        await deleteDoc(doc.ref);
      }
    });
  }
  async agregarPlan(plan: any): Promise<void> {
    try {
      const planesRef = collection(db, 'planes');
      await setDoc(doc(planesRef), plan);
      this.obtenerPlanes();
    } catch (error) {
      console.error('Error al agregar el plan:', error);
    }
  }
  async actualizarPlan(plan: any): Promise<void> {
    try {
      const planDocRef = doc(db, 'planes', plan.id);
      await updateDoc(planDocRef, plan);
    } catch (error) {
      console.error('Error al actualizar el plan:', error);
    }
  }
}

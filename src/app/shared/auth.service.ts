import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor() {
    // Verificar si hay un usuario logueado en el localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.userSubject.next(JSON.parse(storedUser));
    }
  }

  // Método para obtener el usuario actual
  get user() {
    return this.userSubject.asObservable();
  }

  // Método para iniciar sesión
  login(userData: any) {
    localStorage.setItem('user', JSON.stringify(userData));
    this.userSubject.next(userData);  // Actualizar el estado de sesión
  }

  // Método para cerrar sesión
  logout() {
    localStorage.removeItem('user');
    this.userSubject.next(null);  // Actualizar el estado de sesión
  }
}

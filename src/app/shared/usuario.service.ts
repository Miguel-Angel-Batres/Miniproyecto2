import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

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
  }

  get user() {
    return this.userSubject.asObservable();
  }

  login(userData: any): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
    this.userSubject.next(userData);
    if(userData.rol !== 'admin') {
      this.route.navigate(['/perfil']);
    }else{
      this.route.navigate(['/perfil_admin']);
    }
    
  }

  logout(): void {
    localStorage.removeItem(this.USER_KEY);
    this.userSubject.next(null);
  }

  isAuthenticated(): boolean {
    return this.userSubject.value !== null;
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
}

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import Swal from 'sweetalert2';
import {
  signInWithEmailAndPassword,
  FacebookAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
  linkWithPopup,
  unlink,
  signOut,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  collection,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { auth, db } from '../../firebase';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private readonly USER_KEY = 'user';
  private readonly predefinedNumbers: Record<string, string> = {
    '+521111111111': '123456',
    '+521222222222': '654321',
    '+521333333333': '111222',
  };
  private apiUrl = 'http://localhost:3000/api/'; 

  private userSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private usersSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  private pagosSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  private planesSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>(
    []
  );
  private vinculacionesSubject = new BehaviorSubject<{
    googleVinculado: boolean;
    facebookVinculado: boolean;
  }>({
    googleVinculado: false,
    facebookVinculado: false,
  });
  private recaptchaVerifier: any;

  vinculaciones$: Observable<{
    googleVinculado: boolean;
    facebookVinculado: boolean;
  }> = this.vinculacionesSubject.asObservable();

  constructor(private route: Router) {
    const storedUser = localStorage.getItem(this.USER_KEY);
    if (storedUser) {
      this.userSubject.next(JSON.parse(storedUser));
    }
  }

  get user() {
    return this.userSubject.asObservable();
  }
  get users() {
    return this.usersSubject.asObservable();
  }
  get pagos() {
    return this.pagosSubject.asObservable();
  }
  get planes() {
    return this.planesSubject.asObservable();
  }

  isAdmin(): boolean {
    const user = this.userSubject.value;
    return user && user.rol === 'admin';
  }

  async manageAttemps(email: string): Promise<void> {
    const verificarAttemps = await fetch(
      `${this.apiUrl}/verificar-attemps`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      }
    );
    const result = await verificarAttemps.json();

    if (result.bloqueo) {
      Swal.fire({
        icon: 'error',
        title: 'Cuenta bloqueada',
        html: 'Usuario o contraseña incorrectos. Intenta nuevamente. <a href="#" id="recuperar-link"> Recuperar tu contraseña </a>',
        didRender: () => {
          const link = document.getElementById('recuperar-link');
          if (link) {
            link.addEventListener('click', async (event) => {
              event.preventDefault();
              try {
                const capturedEmail = email; 
                const response = await fetch(
                  '${this.apiUrl}/recuperar-cuenta',
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email: capturedEmail }),
                  }
                );
                let result;
                try {
                  result = await response.json();
                } catch (parseError) {
                  console.error('Error al parsear la respuesta:', parseError);
                  Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Respuesta inválida del servidor.',
                  });
                  return;
                }
                if (response.ok) {
                  Swal.fire({
                    icon: 'success',
                    title: 'Correo enviado',
                    text: 'Espera al adminitrador para que desbloquee tu cuenta.',
                  });
                } else {
                  Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text:
                      result.message ||
                      'No se pudo enviar el correo de recuperación.',
                  });
                }
              } catch (error) {
                console.error(
                  'Error al enviar el correo de recuperación:',
                  error
                );
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: 'Ocurrió un error al intentar enviar el correo de recuperación.',
                });
              }
            });
          }
        },
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Usuario o contraseña incorrectos. Intenta nuevamente.',
      });
    }
  }

  async login(email: string, password: string): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Error al iniciar sesión');
      }

      const user = await response.json();
      if (user.Bloqueado) {
        Swal.fire({
          icon: 'error',
          title: 'Cuenta bloqueada',
          text: 'Tu cuenta ha sido bloqueada. Por favor, contacta al soporte.',
        });
        this.route.navigate(['/']);
        return false;
      }

      this.userSubject.next(user);
      return true;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Usuario o contraseña incorrectos. Intenta nuevamente.',
      });
      return false;
    }
  }

  async registrarUsuario(
    email: string,
    password: string,
    extraData: any
  ): Promise<any> {
    try {
      const verificarEmail = await fetch(
        `${this.apiUrl}/verificar-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        }
      );
      const emailResult = await verificarEmail.json();
      if (emailResult.exists) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'El correo electrónico ya está registrado.',
        });
        return;
      }

      const response = await fetch('${this.apiUrl}/registro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          extraData,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.message || 'Ocurrió un error al registrar el usuario.',
        });
        return;
      }

      Swal.fire({
        icon: 'success',
        title: 'Registro exitoso',
        text: 'Por favor, revisa tu correo para confirmar tu cuenta.',
      });
      this.route.navigate(['/login']);
    } catch (error: any) {
      console.error('Error al registrar el usuario:', error);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Ocurrió un error al registrar el usuario.',
      });
    }
  }

  logout(): void {
    localStorage.removeItem(this.USER_KEY);
    this.userSubject.next(null);
  }

  isAuthenticated(): boolean {
    return this.userSubject.value !== null;
  }
  async obtenerPagos(): Promise<any[]> {
    try {
      const response = await fetch(`${this.apiUrl}/pagos`);
      const data = await response.json();
      console.log('Pagos obtenidos:', data);
      this.pagosSubject.next(data);
      return data;
    } catch (error) {
      console.error('Error al obtener los pagos:', error);
      return [];
    }
  }

  async obtenerUsuarios(): Promise<any[]> {
    try {
      const response = await fetch(`${this.apiUrl}/usuarios`);
      const data = await response.json();
      console.log('Usuarios obtenidos:', data);
      this.usersSubject.next(data);
      return data;
    } catch (error) {
      console.error('Error al obtener los usuarios:', error);
      return [];
    }
  }

  async obtenerPlanes(): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/planes`);
      if (!response.ok) {
        throw new Error('Error al obtener los planes');
      }
      const planes = await response.json();
      this.planesSubject.next(planes);
    } catch (error) {
      console.error('Error al obtener los planes:', error);
      this.planesSubject.next([]);
    }
  }
  async obtenerPlan(planId: string) {
    try{
      const response = await fetch(`${this.apiUrl}/planes/${planId}`);
      if (!response.ok) {
        throw new Error('Error al obtener el plan');
      }
      const plan = await response.json();
      return plan;
    }
    catch (error) {
      console.error('Error al obtener el plan:', error);
      return null;
    }
  }


  async obtenerUsuarioLogeado(): Promise<any> {
    const usuarioActual = this.userSubject.value;
    if (!usuarioActual) return null;

    try {
      const response = await fetch(
        `${this.apiUrl}/usuarios/${usuarioActual.uid}`
      );
      if (!response.ok) {
        throw new Error('Error al obtener el usuario logeado');
      }
      const usuario = await response.json();
      this.userSubject.next(usuario);
      return usuario;

    } catch (error) {
      console.error('Error al obtener el usuario logeado:', error);
      return null;
    }
  }
  async actualizarUsuario(usuario: any): Promise<void> {
    try {
      if (usuario.contraseña !== '' && usuario.contraseña !== undefined) {
        const response = await fetch(`${this.apiUrl}/actualizar-contrasena`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uid: usuario.uid,
            contraseña: usuario.contraseña,
          }),
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || 'Error al actualizar la contraseña');
        }
        const data = await response.json();
        delete usuario.contraseña;
      }

      const response = await fetch(`${this.apiUrl}/usuarios/${usuario.uid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(usuario),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Error al actualizar el usuario');
      }
      const updatedUser = await response.json();
      this.userSubject.next(updatedUser); 
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Usuario actualizado correctamente.',
      });
    } catch (error) {
      console.error('Error al actualizar el usuario:', error);
    }
  }
  async actualizarfotoPerfil(uid: string, imagen: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.apiUrl}/usuarios/${uid}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imagenPerfil: imagen }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || 'Error al actualizar la foto de perfil'
        );
      }
      const updatedUser = await response.json();
      this.userSubject.next(updatedUser);
        Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Foto de perfil actualizada correctamente.',
      });

    } catch (error) {
      console.error('Error al actualizar la foto de perfil:', error);
    }
  }

  async eliminarUsuario(uid: string): Promise<void> {
    try{
      const response = await fetch(`${this.apiUrl}/usuarios/${uid}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || 'Error al eliminar el usuario'
        );
      }
      const usuarios = this.usersSubject.value.filter((u) => u.uid !== uid);
      this.usersSubject.next(usuarios);
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Usuario eliminado correctamente.',
      });
    }
    catch (error) {
      console.error('Error al eliminar el usuario:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el usuario. Inténtalo nuevamente.',
      });
    }
  }

  async obtenerPagosUsuario(): Promise<any[]> {
    const usuario = await this.obtenerUsuarioLogeado();
    return usuario?.pagos || [];
  }
  async eliminarPlan(plan: any): Promise<void> {
    try {
      const response = await fetch(
        `${this.apiUrl}/planes/${plan.id}`,
        {
          method: 'DELETE',
        }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || 'Error al eliminar el plan'
        );
      }
      const planes = this.planesSubject.value.filter((p) => p.id !== plan.id);
      this.planesSubject.next(planes);
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Plan eliminado correctamente.',
      });
    } catch (error) {
      console.error('Error al eliminar el plan:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el plan. Inténtalo nuevamente.',
      });
    }
  }
  async agregarPlan(plan: any): Promise<void> {
    try{
      const response = await fetch(`${this.apiUrl}/planes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(plan),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || 'Error al agregar el plan'
        );
      }
      const newPlan = await response.json();
      const planes = [...this.planesSubject.value, newPlan];
      this.planesSubject.next(planes);
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Plan agregado correctamente.',
      });
    }
    catch (error) {
      console.error('Error al agregar el plan:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo agregar el plan. Inténtalo nuevamente.',
      });
    }
  }
  async actualizarPlan(plan: any): Promise<void> {
   try{
    const response = await fetch(
      `${this.apiUrl}/planes/${plan.id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(plan),
      }
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || 'Error al actualizar el plan'
      );
    }
    const updatedPlan = await response.json();
    const planes = this.planesSubject.value.map((p) =>
      p.id === updatedPlan.id ? updatedPlan : p
    );
    this.planesSubject.next(planes);
    } catch (error) {
      console.error('Error al actualizar el plan:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el plan. Inténtalo nuevamente.',
      });

   }
  }
  async loginWithGoogle(): Promise<boolean> {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const existe = await this.verifyUserInDatabase(user);

      if (!existe) {
        await user.delete();
        await signOut(auth);

        Swal.fire({
          icon: 'warning',
          title: 'Cuenta no registrada',
          text: 'No hay una cuenta vinculada a este acceso. Por favor, regístrate primero.',
        });

        return false;
      }

      return true;
    } catch (error) {
      console.error('Error en loginWithGoogle:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al iniciar sesión con Google.',
      });
      return false;
    }
  }
  inicializarRecaptcha(
    containerId: string,
    size: 'normal' | 'invisible' = 'invisible'
  ): void {
    if (this.recaptchaVerifier) {
      console.warn('ReCAPTCHA ya está inicializado. Reinicializando...');
      return; 
    }

    this.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: size,
      callback: (response: any) => {
      },
      'expired-callback': () => {
        console.warn('reCAPTCHA expirado. Por favor, resuélvelo nuevamente.');
      },
    });

    this.recaptchaVerifier.render();
  }
  async loginWithPhone(phoneNumber: string): Promise<boolean> {
    if (!this.recaptchaVerifier) {
      this.inicializarRecaptcha('recaptcha-container');
      throw new Error('reCAPTCHA no está inicializado.');
    }

    try {
      if (this.predefinedNumbers[phoneNumber]) {
        const confirmationResult = await signInWithPhoneNumber(
          auth,
          phoneNumber,
          this.recaptchaVerifier
        );

        const predefinedCode = this.predefinedNumbers[phoneNumber];
        let code: string | null = null;

        do {
          const verificationCode = await Swal.fire({
            title: 'Código de verificación',
            text: 'Por favor, ingresa el código de verificación enviado a tu teléfono:',
            input: 'text',
            inputValidator: (value) => {
              if (!value) {
                return 'Debes ingresar un código.';
              }
              return null;
            },
            showCancelButton: false,
            confirmButtonText: 'Verificar',
          });

          if (verificationCode.dismiss === Swal.DismissReason.cancel) {
            console.warn('El usuario canceló el código de verificación.');
            this.recaptchaVerifier = null;
            return false;
          }

          code = verificationCode.value;

          if (code === predefinedCode) {
            const result = await confirmationResult.confirm(code);
            const user = result.user;
            const log = await this.verifyUserInDatabase(user);
            if (!log) {
              await user.delete();
              await signOut(auth);

              Swal.fire({
                icon: 'warning',
                title: 'Cuenta no registrada',
                text: 'No hay una cuenta vinculada a este acceso. Por favor, regístrate primero.',
              });
              this.recaptchaVerifier = null;
              return false;
            }
            this.recaptchaVerifier = null;
            return true;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'El código ingresado es incorrecto. Inténtalo nuevamente.',
            });
          }
        } while (code !== predefinedCode);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ingrese un número válido.',
        });
        this.recaptchaVerifier = null;
        return false;
      }
    } catch (error) {
      console.error('Error en loginWithPhone:', error);

      if (this.recaptchaVerifier) {
        this.recaptchaVerifier = null;
      }

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al iniciar sesión con el teléfono.',
      });

      return false;
    } finally {
      this.recaptchaVerifier = null;
    }

    return false; 
  }
  private async verifyUserInDatabase(user: any): Promise<boolean> {
    if (!user) return false;

    try {
      const response = await fetch(`${this.apiUrl}/usuarios/${user.uid}`);
      if (!response.ok) {
      console.warn('Usuario autenticado, pero no existe en la colección usuarios');
      this.userSubject.next(null);
      return false;
      }

      const usuarioCompleto = await response.json();
      this.userSubject.next(usuarioCompleto);
      return true;
    } catch (error) {
      console.error('Error al verificar usuario en la base de datos:', error);
      this.userSubject.next(null);
      return false;
    }
  }

  async vincularConGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      console.error('No hay usuario autenticado');
      throw new Error('No hay usuario autenticado');
    }

    try {
      await linkWithPopup(currentUser, provider);
    } catch (error) {
      console.error('Error al vincular cuenta de Google:', error);
      throw error;
    }
  }
  
  async desvincularProveedor(
    proveedor: 'google.com' | 'facebook.com' | 'phone'
  ) {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('No hay usuario autenticado');

    try {
      const resultado = await unlink(currentUser, proveedor);
    } catch (error) {
      console.error(`Error al desvincular ${proveedor}:`, error);
      throw error;
    }
  }

  async obtenerProveedoresVinculados(): Promise<void> {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      console.error('No hay usuario autenticado');
      return;
    }

    const providers = currentUser.providerData.map(
      (provider) => provider.providerId
    );
    const vinculaciones = {
      googleVinculado: providers.includes('google.com'),
      facebookVinculado: providers.includes('facebook.com'),
    };

    this.vinculacionesSubject.next(vinculaciones);
  }
}

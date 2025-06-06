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
      'https://gimnasio-santa-cruz-ww7d.onrender.com/api/verificar-attemps',
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
                  'https://gimnasio-santa-cruz-ww7d.onrender.com/api/recuperar-cuenta',
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
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      if (!userCredential) {
        console.warn('No se pudo obtener las credenciales del usuario.');
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo iniciar sesión. Por favor, intenta nuevamente.',
        });
        return false;
      }
      const user = userCredential.user;
      const userDocRef = doc(db, 'usuarios', user.uid);

      if (user) {
        console.log('Usuario logeado exitosamente:', user.email);
      } else {
        console.warn('No se pudo iniciar sesión.');
      }

      const userSnapshot = await getDoc(userDocRef);
      if (userSnapshot.exists()) {
        const usuarioCompleto = userSnapshot.data();
        if (usuarioCompleto['Bloqueado']) {
          Swal.fire({
            icon: 'error',
            title: 'Cuenta bloqueada',
            text: 'Tu cuenta ha sido bloqueada. Por favor, contacta al soporte.',
          });
          this.route.navigate(['/']);
          return false;
        }

        // Resetear intentos fallidos a 0
        await updateDoc(userDocRef, { intentosFallidos: 0 });

        this.userSubject.next(usuarioCompleto);
      } else {
        this.userSubject.next(null);
      }
      return true;
    } catch (error: any) {
      this.manageAttemps(email);
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
        'https://gimnasio-santa-cruz-ww7d.onrender.com/api/verificar-email',
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

      const response = await fetch('https://gimnasio-santa-cruz-ww7d.onrender.com/api/registro', {
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
  async obtenerPagos(){
    try {
      const user = this.userSubject.value;
      if (!user) return [];

      const pagosRef = collection(db, 'pagos');
      const pagosSnapshot = await getDocs(pagosRef);
      const pagos = pagosSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      this.pagosSubject.next(pagos);
      return pagos;
    } catch (error) {
      console.error('Error al obtener los pagos:', error);
      return [];
    }
  }
  async obtenerUsuarios() {
    fetch('https://gimnasio-santa-cruz-ww7d.onrender.com/api/usuarios')
      .then((response) => response.json())
      .then((data) => {
        this.usersSubject.next(data);
        return data;
      })
      .catch((error) => {
        console.error('Error al obtener los usuarios:', error);
        return [];
      });
  }
  obtenerPlanes(): void {
    fetch('https://gimnasio-santa-cruz-ww7d.onrender.com/api/planes')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error al obtener los planes');
        }
        return response.json();
      })
      .then((planes) => {
        this.planesSubject.next(planes);
      })
      .catch((error) => {
        console.error('Error al obtener los planes:', error);
        this.planesSubject.next([]); 
      });
  }
  async obtenerPlan(planNombre: string) {
    try {
      const planes = collection(db, 'planes');
      const snapshot = await getDocs(planes);
      const plan = snapshot.docs.find((doc) => doc.data()['nombre'] === planNombre);
      return plan ? { ...plan.data() } : null;
    } catch (error) {
      console.error('Error al obtener el plan:', error);
      return null;
    }
  }


  async obtenerUsuarioLogeado(): Promise<any> {
    const usuarioActual = this.userSubject.value;
    if (!usuarioActual) return null;

    try {
      const userDocRef = doc(db, 'usuarios', usuarioActual.uid);
      const userSnapshot = await getDoc(userDocRef);
      if (userSnapshot.exists()) {
        return { ...userSnapshot.data() };
      }
      return null;
    } catch (error) {
      console.error('Error al obtener el usuario logeado:', error);
      return null;
    }
  }
  async actualizarUsuario(usuario: any): Promise<void> {
    try {
      if(usuario.contraseña!== '' && usuario.contraseña !== undefined){
        const response = await fetch('https://gimnasio-santa-cruz-ww7d.onrender.com/api/actualizar-contrasena', {
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
      }else{
        delete usuario.contraseña; 
      }      
      const userDocRef = doc(db, 'usuarios', usuario.uid);
      await updateDoc(userDocRef, usuario);
      const usuarios = this.usersSubject.value.map((u) =>
        u.uid === usuario.uid ? { ...u, ...usuario } : u
      );
      this.usersSubject.next(usuarios);
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
      const userDocRef = doc(db, 'usuarios', uid);
      await updateDoc(userDocRef, { imagenPerfil: imagen });
      const usuarios = this.usersSubject.value.map((u) =>
        u.uid === uid ? { ...u, imagenPerfil: imagen } : u
      );
      this.usersSubject.next(usuarios);
    } catch (error) {
      console.error('Error al actualizar la foto de perfil:', error);
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

    const userRef = doc(db, 'usuarios', user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const usuarioCompleto = userSnap.data();
      this.userSubject.next(usuarioCompleto);
      return true;
    } else {
      console.warn(
        'Usuario autenticado, pero no existe en la colección usuarios'
      );
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

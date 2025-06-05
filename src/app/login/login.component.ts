import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuarioService } from '../shared/usuario.service';
import Swal from 'sweetalert2';
import { ScCheckboxReCaptcha } from '@semantic-components/re-captcha';
import { recaptchav2Config } from '../../env';
//material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
imports: [
  ReactiveFormsModule,
  ScCheckboxReCaptcha,
  RouterModule,
  MatFormFieldModule,
  MatInputModule,
  MatButtonModule,
  MatIcon
],  standalone: true
})
export class LoginComponent {

  siteKey = recaptchav2Config.v2SiteKey;
  loginForm: FormGroup;
  loginAttemps: number = 0;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private usuarioService: UsuarioService
  ) {
    this.loginForm = this.fb.group({
      correo: ['',Validators.required],
      contraseña: ['', [Validators.required]]      ,
      captcha: ['', Validators.required] // <-- agrega captcha aquí
   });
   
  }

async onSubmit() {
  // if (!this.loginForm.value.captcha) {
  //   Swal.fire({
  //     icon: 'error',
  //     title: 'Captcha requerido',
  //     text: 'Por favor, resuelve el reCAPTCHA antes de iniciar sesión.',
  //   });
  //   return;
  // }

  // Aquí puedes validar los otros campos si quieres
  if (this.loginForm.invalid) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Por favor, completa todos los campos requeridos.',
    });
    return;
  }
    const log = await this.usuarioService.login(this.loginForm.value.correo, this.loginForm.value.contraseña);
    if (log) {
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Has iniciado sesión correctamente.',
      });
      if(this.usuarioService.isAdmin()) {
        this.router.navigate(['/perfil_admin']);
      }else{
        this.router.navigate(['/perfil']);
      }
    }
  

}
  async onGoogleLogin() {
    try {
      const googleUser = await this.usuarioService.loginWithGoogle();
      if (googleUser) {
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Has iniciado sesión con Google correctamente.',
        });
        this.router.navigate(['/perfil']);
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo iniciar sesión con Google.',
      });
    }
  }
  phoneForm() {
    // Lógica para mostrar el formulario de teléfono
    this.usuarioService.inicializarRecaptcha('recaptcha-container', 'invisible');

    Swal.fire({
      title: 'Iniciar sesión con teléfono',
      html: `
        <input type="text" id="phone" class="swal2-input" placeholder="Número de teléfono">
        <div id="recaptcha-container"></div>
      `,
      focusConfirm: false,
      preConfirm: () => {
        const phoneNumber = (document.getElementById('phone') as HTMLInputElement).value;
        if (!phoneNumber) {
          Swal.showValidationMessage('Por favor, ingresa un número de teléfono válido.');
        }
        return { phoneNumber };
      },
    }).then((result) => {
      if (result.isConfirmed && result.value?.phoneNumber) {
        this.onPhoneLogin(result.value.phoneNumber);
      }
    });
  }

  async onPhoneLogin(phoneNumber: string) {
    try {
      const phoneUser = await this.usuarioService.loginWithPhone(phoneNumber);
      if (phoneUser) {
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Has iniciado sesión con tu teléfono correctamente.',
        });
        this.router.navigate(['/perfil']);
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo iniciar sesión con tu teléfono.',
      });
    }
  }
}

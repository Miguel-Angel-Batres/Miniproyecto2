import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UsuarioService } from '../shared/usuario.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

import { SecuredomPipe } from '../securedom.pipe';
@Component({
  selector: 'app-footer',
  imports: [RouterModule, CommonModule, SecuredomPipe],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  user: any = null;

  constructor(private usuarioService: UsuarioService,private router: Router) {}

  ngOnInit(): void {
    this.usuarioService.user.subscribe(user => {
      this.user = user;
    });
  }

  logout() {
    this.usuarioService.logout();
    this.router.navigate(['/inicio']);
    Swal.fire({
      icon: 'success',
      title: 'Sesión cerrada',
      showConfirmButton: false,
      timer: 1500
    });
  }
    address: string = 'Calle Falsa 123, CDMX';
  phone: string = '+52 55 1234 5678';
  email: string = 'contacto@SantaCruzGYM.com';
}

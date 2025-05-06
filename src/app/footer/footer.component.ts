import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../shared/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-footer',
  imports: [RouterModule, CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  user: any = null;

  constructor(private authService: AuthService,private router: Router) {}

  ngOnInit(): void {
    this.authService.user.subscribe(user => {
      this.user = user;
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/inicio']);
    Swal.fire({
      icon: 'success',
      title: 'Sesión cerrada',
      showConfirmButton: false,
      timer: 1500
    });
  }
  
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../shared/auth.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
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

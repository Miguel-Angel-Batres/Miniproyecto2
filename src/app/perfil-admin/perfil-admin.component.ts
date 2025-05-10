import { Component, OnInit } from '@angular/core';
import { UsuarioService } from '../shared/usuario.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { Plan } from '../models/planes.model';
import { S } from '@angular/cdk/keycodes';

@Component({
  selector: 'app-perfil-admin',
  templateUrl: './perfil-admin.component.html',
  styleUrls: ['./perfil-admin.component.css'],
  standalone: true,
  imports: [FormsModule]
})
export class PerfilAdminComponent implements OnInit {
  usuario: any = null;
  usuarios: any[] = [];
  pagos: any[] = [];
  planes: any[] = [];
  usuarioEditando: any = null;
  planEditando: any = null;
  nuevoBeneficio: string = '';
  beneficioSeleccionado: string = '';
  editandoPerfil: boolean = false;
  nuevoPlan: Plan = {
    nombre: '',
    precio: 0,
    beneficios: [],
    fechaInicio: '',
    fechaFin: '',
    estado: '',
    tipo: '',
    descripcion: ''
  };

  

  constructor(
    private usuarioService: UsuarioService,
    private router: Router
  ) {}
  ventanas = {
    usuarios: false,
    pagos: false,
    planes: false,
    estadisticas: false,
    nuevoplan: false
  };
  

  ngOnInit(): void {
    this.usuarioService.user.subscribe(user => {
      this.usuario = user;
    });
    this.usuarios = this.usuarioService.obtenerUsuarios();
    this.pagos = JSON.parse(localStorage.getItem('pagos') || '[]');
    this.planes = JSON.parse(localStorage.getItem('planes') || '[]');
  }

  logout(): void {
    this.usuarioService.logout();
    Swal.fire({
      icon: 'success',
      title: 'Sesión cerrada',
      showConfirmButton: false,
      timer: 3000
    });

    this.router.navigate(['/inicio']);
    
  }


  editarPerfil(): void {
    console.log('Editar perfil');
  }

  gestionarUsuarios(): void {
    this.ventanas.usuarios = true;
  }

  gestionarPagos(): void {
    this.ventanas.pagos = true;
  }

  verPlanes(): void {
    this.ventanas.planes = true;
  }

  verEstadisticas(): void {
    this.ventanas.estadisticas = true;
  }

  eliminarUsuario(nombre:string): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Quieres eliminar a ${nombre}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.usuarioService.eliminarUsuario(nombre);
        this.usuarios = this.usuarioService.obtenerUsuarios(); 
        Swal.fire(
          'Eliminado!',
          `El usuario ${nombre} ha sido eliminado.`,
          'success'
        );
        window.location.reload();
      }
    });
  }
  
  editarUsuario(usuario: any) {
    this.usuarioEditando = { ...usuario };
  }

  cancelarEdicion() {
    this.usuarioEditando = null;
  }

  guardarCambios() {
    this.usuarioService.actualizarUsuario(this.usuarioEditando);
    this.usuarioEditando = null;
    this.usuarios = this.usuarioService.obtenerUsuarios(); 
  }



  eliminarPago(pago: any) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Quieres eliminar el pago de ${pago.usuario}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        const index = this.pagos.indexOf(pago);
        if (index > -1) {
          this.pagos.splice(index, 1);
          localStorage.setItem('pagos', JSON.stringify(this.pagos));
          Swal.fire(
            'Eliminado!',
            `El pago de ${pago.usuario} ha sido eliminado.`,
            'success'
          );
        }
      }
    });
  }
  editarPlan(plan: any) {
    this.planEditando = {
      ...plan,
      beneficios: [...plan.beneficios]  
    };
  }
  
  eliminarPlan(plan: any) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Quieres eliminar el plan de ${plan.usuario}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.usuarioService.eliminarPlan(plan);
        this.planes = JSON.parse(localStorage.getItem('planes') || '[]');
        
        Swal.fire(
          'Eliminado!',
          `El plan de ${plan.usuario} ha sido eliminado.`,
          'success'
        );
      }
    });

  }
  agregarBeneficio() {
    if (this.nuevoBeneficio.trim()) {
      this.planEditando.beneficios.push(this.nuevoBeneficio.trim());
      this.nuevoBeneficio = '';
    }
  }
  guardarNuevoPlan() {
    if (!this.nuevoPlan || 
      !this.nuevoPlan.nombre?.trim() || 
      !this.nuevoPlan.descripcion?.trim() ||
      !this.nuevoPlan.tipo?.trim() ||
      this.nuevoPlan.precio <= 0) {     
         Swal.fire({
        icon: 'error',
        title: 'Campos incompletos o inválidos',
        text: 'Por favor completa todos los campos requeridos con valores válidos.',
        confirmButtonText: 'Aceptar'
      });
      return;
    }
  
    this.usuarioService.agregarPlan(this.nuevoPlan);
    this.planes = JSON.parse(localStorage.getItem('planes') || '[]'); 
  
    Swal.fire({
      icon: 'success',
      title: 'Plan agregado',
      text: `El plan ${this.nuevoPlan.nombre} ha sido agregado.`,
      confirmButtonText: 'Aceptar'
    });
  
    this.nuevoPlan = {
      nombre: '',
      precio: 0,
      beneficios: [],
      estado: '',
      descripcion: '',
      tipo: ''
    };
    this.ventanas.nuevoplan = false;
  }
  
  guardarCambiosPlan() {
    console.log(this.planEditando);
    const planes = JSON.parse(localStorage.getItem('planes') || '[]');
    const index = planes.findIndex((p: any) => p.nombre === this.planEditando.nombre);
    if (index !== -1) {
      planes[index] = this.planEditando;
      localStorage.setItem('planes', JSON.stringify(planes));
      Swal.fire({
        icon: 'success',
        title: 'Plan actualizado',
        text: `El plan ${this.nuevoPlan.nombre} ha sido actualizado.`,
        confirmButtonText: 'Aceptar'
      });
    }
    this.planEditando = null;
    this.planes = JSON.parse(localStorage.getItem('planes') || '[]');
  
  }
  cancelarEdicionPlan() {
    this.planEditando = null;
  }
  eliminarBeneficio(beneficio: string) {
    if(beneficio){
      const index = this.planEditando.beneficios.indexOf(beneficio);
      if (index > -1) {
        this.planEditando.beneficios.splice(index, 1);
      }
      Swal.fire({
        icon: 'success',
        title: 'Beneficio eliminado',
        text: `El beneficio ${beneficio} ha sido eliminado.`,
        confirmButtonText: 'Aceptar'
      });
      this.beneficioSeleccionado = '';
    }else{
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se ha seleccionado ningún beneficio para eliminar.',
        confirmButtonText: 'Aceptar'
      });
      return;
    }
  }
  guardarEdicionPerfil(){
    if(this.editandoPerfil){
      this.usuarioService.actualizarUsuario(this.usuario);
      this.editandoPerfil = false;
      Swal.fire({
        icon: 'success',
        title: 'Perfil actualizado',
        text: `Tu perfil ha sido actualizado.`,
        confirmButtonText: 'Aceptar'
      });
    }
  }
  cancelarEdicionPerfil(){
    this.editandoPerfil = false;
    this.usuario = this.usuarioService.obtenerUsuarioLogeado();
  }
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.usuario.imagenPerfil = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }
}


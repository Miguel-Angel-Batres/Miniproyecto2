import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UsuarioService } from '../shared/usuario.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { Plan } from '../models/planes.model';
import { ChartData } from 'chart.js';
import { GraficoComponent } from '../grafico/grafico.component';
import { PagoService } from '../pagosServicio/pagos.service';
import { Pago, PagoConId } from '../models/pago.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-perfil-admin',
  templateUrl: './perfil-admin.component.html',
  styleUrls: ['./perfil-admin.component.css'],
  standalone: true,

  imports: [FormsModule, GraficoComponent, CommonModule],
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
  nuevoPlan: any = {};
  UsuariosPorPlan: any = {};
  hayUsuariosNormales: boolean = false;
  infoNutricion: any[] = [];
  planEditandoNutricion: any = null;

  constructor(
    private usuarioService: UsuarioService,
    private router: Router,
    private pagoService: PagoService,
    private cdr: ChangeDetectorRef
  ) {}
  ventanas = {
    usuarios: false,
    pagos: false,
    planes: false,
    estadisticas: false,
    nuevoplan: false,
    nutricion: false,
  };

  GraficaPastel: ChartData<'pie'> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
        ],
        hoverBackgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
        ],
      },
    ],
  };
  graficaUsuariosPorFecha: ChartData<'line'> = {
    labels: [],
    datasets: [],
  };
  graficaIngresosPorMes: ChartData<'bar'> = {
    labels: [],
    datasets: [],
  };

  ngOnInit(): void {
    this.usuarioService.user.subscribe((user) => {
      this.usuario = user;
    });
    this.usuarioService.users.subscribe((usuarios) => {
      this.usuarios = usuarios;
      this.hayUsuariosNormales = usuarios.some((u) => u.rol === 'usuario');

      this.UsuariosPorPlan = this.usuarios.reduce((acc: any, usuario: any) => {
        if (usuario.plan.nombre) {
          const plan = usuario.plan.nombre;
          if (!acc[plan]) {
        acc[plan] = 0;
          }
          acc[plan]++;
        }
        return acc;
      }, {});
      const chartLabels = Object.keys(this.UsuariosPorPlan);
      const chartData = Object.values(this.UsuariosPorPlan) as number[];
      
      this.GraficaPastel = {
        labels: chartLabels,
        datasets: [
          {
        data: chartData,
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
        ],
        hoverBackgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
        ],
          },
        ],
      };

      
      const registrosPorFecha: { [key: string]: number } = {};
      this.usuarios.forEach((usuario) => {
        const fecha = new Date(usuario.fechaRegistro)
          .toISOString()
          .split('T')[0]; // YYYY-MM-DD
        registrosPorFecha[fecha] = (registrosPorFecha[fecha] || 0) + 1;
      });

      const fechas = Object.keys(registrosPorFecha).sort();
      const registros = fechas.map((fecha) => registrosPorFecha[fecha]);

      this.graficaUsuariosPorFecha = {
        labels: fechas,
        datasets: [
          {
            label: 'Usuarios Registrados',
            data: registros,
            fill: false,
            borderColor: '#42A5F5',
            backgroundColor: '#42A5F5',
            tension: 0.4,
          },
        ],
      };
      
    });
    this.usuarioService.obtenerUsuarios();


    this.usuarioService.pagos.subscribe((pagos) => {
      this.pagos = pagos;
      const ingresosPorMes: { [key: string]: number } = {};

    this.pagos.forEach((pago) => {
      const fecha = new Date(pago.fechaPago);
      const mes = `${fecha.getFullYear()}-${(fecha.getMonth() + 1)
        .toString()
        .padStart(2, '0')}`; // Formato YYYY-MM
      ingresosPorMes[mes] = (ingresosPorMes[mes] || 0) + pago.monto;
    });

    const meses = Object.keys(ingresosPorMes).sort();
    const ingresos = meses.map((mes) => ingresosPorMes[mes]);

    this.graficaIngresosPorMes = {
      labels: meses,
      datasets: [
        {
          label: 'Ingresos ($)',
          data: ingresos,
          backgroundColor: '#4CAF50',
          borderColor: '#388E3C',
          borderWidth: 1,
        },
      ],
    };
    });
    this.usuarioService.obtenerPagos();
    this.usuarioService.planes.subscribe((planes) => {
      this.planes = planes;
    });
    this.usuarioService.obtenerPlanes();
    this.infoNutricion = this.usuarioService.infoNutricion();
    this.usuarioService.obtenerInfoNutricion();

    
  }

  logout(): void {
    this.usuarioService.logout();
    Swal.fire({
      icon: 'success',
      title: 'Sesión cerrada',
      showConfirmButton: false,
      timer: 3000,
    });

    this.router.navigate(['/inicio']);
  }

  eliminarPago(pago: PagoConId): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Vas a eliminar el pago de ${pago.titular}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.pagoService
          .eliminarPago(pago.id)
          .then(() => {
            // Quitar el pago de la lista actual
            this.pagos = this.pagos.filter((p) => p.id !== pago.id);
            Swal.fire('Eliminado', 'El pago ha sido eliminado.', 'success');
          })
          .catch((error) => {
            console.error('Error al eliminar pago:', error);
            Swal.fire('Error', 'No se pudo eliminar el pago.', 'error');
          });
      }
    });
  }


  gestionarUsuarios(): void {
    this.ventanas.usuarios = true;
  }
  gestionarNutricion(): void {
    this.ventanas.nutricion = true;
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

  eliminarUsuario(nombre: string): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Quieres eliminar a ${nombre}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        const usuario = this.usuarios.find((u) => u.nombre === nombre);
        this.usuarioService.eliminarUsuario(usuario.uid);
        Swal.fire(
          'Eliminado!',
          `El usuario ${nombre} ha sido eliminado.`,
          'success'
        );
      }
    });
  }

  editarUsuario(usuario: any) {
    this.usuarioEditando = { ...usuario, contraseña: '' };
  }

  cancelarEdicion() {
    this.usuarioEditando = null;
  }

  guardarCambios() {

    if(this.usuarioEditando.Bloqueado === false){
      this.usuarioEditando.IntentosFallidos = 0;
    }
    this.usuarioService.actualizarUsuario(this.usuarioEditando);
    
    this.usuarioEditando = null;
  }
  eliminarPlanNutricion(plan: any) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Quieres eliminar el plan de nutrición de ${plan.usuario}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.usuarioService.eliminarPlanNutricion(plan);
        this.infoNutricion = JSON.parse(localStorage.getItem('infoNutricion') || '[]');
        Swal.fire(
          'Eliminado!',
          `El plan de nutrición de ${plan.usuario} ha sido eliminado.`,
          'success'
        );
      }
    });
  }
  editarPlanNutricion(plan: any) {
    this.planEditandoNutricion = { ...plan };
    console.log(this.planEditandoNutricion);
  } 
  guardarCambiosNutricion() {
    if (
      !this.planEditandoNutricion ||
      !this.planEditandoNutricion.fechaInicio ||
      !this.planEditandoNutricion.fechaFin ||
      !this.planEditandoNutricion.alimentos ||
      !this.planEditandoNutricion.objetivo ||
      !this.planEditandoNutricion.sexo ||
      !this.planEditandoNutricion.peso ||
      !this.planEditandoNutricion.altura ||
      !this.planEditandoNutricion.deportes
    ) {
      Swal.fire({
        icon: 'error',
        title: 'Campos incompletos o inválidos',
        text: 'Por favor completa todos los campos requeridos con valores válidos.',
        confirmButtonText: 'Aceptar',
      });
      return;
    }
    this.usuarioService.actualizarPlanNutricion(this.planEditandoNutricion);
    Swal.fire({
      icon: 'success',
      title: 'Plan de nutrición actualizado',
      text: `El plan de nutrición de ${this.planEditandoNutricion.usuario} ha sido actualizado.`,
      confirmButtonText: 'Aceptar',
    });
    this.planEditandoNutricion = null;
  }
  cancelarEdicionNutricion() {
    this.planEditandoNutricion = null;
  }


  editarPlan(plan: any) {
    this.planEditando = plan;
  }

  eliminarPlan(plan: any) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Quieres eliminar el plan de ${plan.usuario}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
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
    if (
      !this.nuevoPlan ||
      !this.nuevoPlan.nombre ||
      !this.nuevoPlan.descripcion ||
      !this.nuevoPlan.tipoPago ||
      this.nuevoPlan.precio <= 0
    ) {
      Swal.fire({
        icon: 'error',
        title: 'Campos incompletos o inválidos',
        text: 'Por favor completa todos los campos requeridos con valores válidos.',
        confirmButtonText: 'Aceptar',
      });
      return;
    }
    this.nuevoPlan.beneficios = this.nuevoPlan.beneficios || [];
    this.usuarioService.agregarPlan(this.nuevoPlan);

    Swal.fire({
      icon: 'success',
      title: 'Plan agregado',
      text: `El plan ${this.nuevoPlan.nombre} ha sido agregado.`,
      confirmButtonText: 'Aceptar',
    });

    this.nuevoPlan = {};
    this.ventanas.nuevoplan = false;
  }

  guardarCambiosPlan() {
    this.usuarioService.actualizarPlan(this.planEditando);
    Swal.fire({
      icon: 'success',
      title: 'Plan actualizado',
      text: `El plan ${this.planEditando.nombre} ha sido actualizado.`,
      confirmButtonText: 'Aceptar',
    });

    this.planEditando = null;
  }
  cancelarEdicionPlan() {
    this.planEditando = null;
  }
  eliminarBeneficio(beneficio: string) {
    if (beneficio) {
      const index = this.planEditando.beneficios.indexOf(beneficio);
      if (index > -1) {
        this.planEditando.beneficios.splice(index, 1);
      }
      Swal.fire({
        icon: 'success',
        title: 'Beneficio eliminado',
        text: `El beneficio ${beneficio} ha sido eliminado.`,
        confirmButtonText: 'Aceptar',
      });
      this.beneficioSeleccionado = '';
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se ha seleccionado ningún beneficio para eliminar.',
        confirmButtonText: 'Aceptar',
      });
      return;
    }
  }
  guardarEdicionPerfil() {
    if (this.editandoPerfil) {
      this.usuarioService.actualizarUsuario(this.usuario);
      this.editandoPerfil = false;
      Swal.fire({
        icon: 'success',
        title: 'Perfil actualizado',
        text: `Tu perfil ha sido actualizado.`,
        confirmButtonText: 'Aceptar',
      });
    }
  }
  cancelarEdicionPerfil() {
    this.editandoPerfil = false;
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

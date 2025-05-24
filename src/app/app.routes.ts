import { Routes } from '@angular/router';
import { InicioComponent } from './inicio/inicio.component';
import { NosotrosComponent } from './nosotros/nosotros.component';
import { DeportesComponent } from './deportes/deportes.component';
import { HorarioscostosComponent } from './horarioscostos/horarioscostos.component';
import { LoginComponent } from './login/login.component';
import { UndeporteComponent } from './undeporte/undeporte.component';
import { FooterComponent } from './footer/footer.component';
import { FormularioSuscripcionComponent } from './formulario-suscripcion/formulario-suscripcion.component';
import { RegistroComponent } from './registro/registro.component';
import { PerfilComponent } from './perfil/perfil.component';
import { PagosComponent } from './pagos/pagos.component';
import { PerfilAdminComponent } from './perfil-admin/perfil-admin.component';

export const routes: Routes = [
    { path: '', redirectTo: '/inicio', pathMatch: 'full' },
    {path: 'inicio', component: InicioComponent},
    {path: 'deportes', component: DeportesComponent}, 
    {path: 'horarioscostos', component: HorarioscostosComponent},
    {path: 'nosotros', component: NosotrosComponent},
    {path: 'login', component: LoginComponent},
    {path: 'deporte/:nombre', component: UndeporteComponent},
    {path: 'footer', component: FooterComponent},
    { path: 'formulario-suscripcion', component: FormularioSuscripcionComponent }, 
    { path: 'registro', component: RegistroComponent },
    { path: 'perfil', component: PerfilComponent },
    { path: 'pagos', component: PagosComponent },
    { path: 'perfil_admin',component: PerfilAdminComponent},
    
];  

import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SecuredomPipe } from '../securedom.pipe';
@Component({
  selector: 'app-footer',
  imports: [RouterModule, SecuredomPipe],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  address: string = 'Calle Falsa 123, CDMX';
  phone: string = '+52 55 1234 5678';
  email: string = 'contacto@SantaCruzGYM.com';
}

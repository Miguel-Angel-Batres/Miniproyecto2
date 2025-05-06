import { Component } from '@angular/core';
import { SecuredomPipe } from '../securedom.pipe';

@Component({
  selector: 'app-inicio',
  imports: [SecuredomPipe],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent {
  video: string = "aHYvmY3nV5U";
}

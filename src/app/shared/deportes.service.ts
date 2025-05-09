import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable} from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Deporte } from '../deporte';

@Injectable({
  providedIn: 'root'
})
export class DeportesService {
  private apiUrl = 'https://santa-cruz-gym.free.beeceptor.com'; 
  private apiUrlExtra = 'https://santa-cruz-gym-1.free.beeceptor.com';//cuando el beeceptor no llegue

  constructor(private http: HttpClient) {}

  getDeportes(): Observable<Deporte[]> {
    return this.http.get<Deporte[]>(this.apiUrl).pipe(
      catchError(err => {
        console.error(`Error con la URL principal (${this.apiUrl}):`, err);
        console.log(`Intentando con la URL de respaldo (${this.apiUrlExtra})...`);
        return this.http.get<Deporte[]>(this.apiUrlExtra); // Intentar con la URL de respaldo
      })
    );
  }
}
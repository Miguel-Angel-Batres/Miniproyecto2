import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of} from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Deporte } from '../deporte';

@Injectable({
  providedIn: 'root'
})
export class DeportesService {
  private apiUrl = 'https://santa-cruz-gym.free.beeceptor.com'; 

  constructor(private http: HttpClient) {}

  getDeportes(): Observable<Deporte[]> {
    return this.http.get<Deporte[]>(this.apiUrl).pipe(
      catchError(err => {
        console.error(`Error con la URL principal (${this.apiUrl}):`, err);
        return this.http.get<Deporte[]>('assets/deportes_de_api.json');// Fallback to local JSON file
        // return of([]); // Fallback to empty array
      })
    );
  }
  
}
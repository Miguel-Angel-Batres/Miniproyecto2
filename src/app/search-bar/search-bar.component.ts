import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-search-bar',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.css'
})
export class SearchBarComponent {
  @Output() searchChange = new EventEmitter<string>(); // Emite el texto de búsqueda
  searchQuery: string = ''; // Almacena el texto de búsqueda

  onSearchInput(): void {
    this.searchChange.emit(this.searchQuery); // Emitir el texto de búsqueda en tiempo real
  }
  onSubmit(event: Event): void {
    event.preventDefault(); // Evitar el comportamiento por defecto del formulario
    this.searchChange.emit(this.searchQuery); // Emitir el texto de búsqueda al enviar
  }
}
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  imports: [CommonModule, FormsModule],
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
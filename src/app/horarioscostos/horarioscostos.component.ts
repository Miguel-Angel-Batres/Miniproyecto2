import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Deporte } from '../deporte';
import { DeportesService } from '../shared/deportes.service';

@Component({
  selector: 'app-horarioscostos',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './horarioscostos.component.html',
  styleUrl: './horarioscostos.component.css'
})
export class HorarioscostosComponent implements OnInit {
  deportes: Deporte[] = [];
  activeTab: string = 'horarios'; // Para controlar las pestañas
  diasSemana: string[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  horarioGimnasio = {
    'Lunes a Viernes': '5:00 AM - 10:00 PM',
    'Sábados': '7:00 AM - 8:00 PM',
    'Domingos y Festivos': '8:00 AM - 2:00 PM'
  };

  constructor(private deporteService: DeportesService) {}

  ngOnInit(): void {
    this.deporteService.getDeportes().subscribe((data: Deporte[]) => {
      this.deportes = data;
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
}
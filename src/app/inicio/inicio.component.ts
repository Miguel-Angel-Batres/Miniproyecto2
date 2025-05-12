import { Component, OnInit } from '@angular/core';
import { SecuredomPipe } from '../securedom.pipe';
import { CommonModule } from '@angular/common';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-inicio',
  imports: [SecuredomPipe, CommonModule],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent implements OnInit {
  video: string = "gr8emAKZV7M";

  images = [
    'assets/inicio/inicio1.avif',
    'assets/inicio/inico4.avif',
    'assets/inicio/inicio3.avif'
  ];

  currentIndex = 0;
  intervalId: any;
  slideDirection = 'right'; // 'left' o 'right'

  ngOnInit(): void {
    this.autoSlide();
  }

  autoSlide() {
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
  }

  prevSlide() {
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
  }

  goToSlide(index: number) {
    this.currentIndex = index;
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }

  servicios = [
    {
      titulo: 'Mejora tu Salud',
      descripcion: 'Entrenamiento personalizado para alcanzar tus metas de salud y bienestar',
      imagen: 'assets/inicio/salud.avif'
    },
    {
      titulo: 'Calidad de Vida',
      descripcion: 'Entrenamiento adaptado a tus necesidades para mejorar tu calidad de vida',
      imagen: 'assets/inicio/bienestar.avif'
    },
    {
      titulo: 'Mayor Rendimiento',
      descripcion: 'Entrenamiento especializado para mejorar tu rendimiento deportivo',
      imagen: 'assets/inicio/iniciofisi.avif'
    }
  ];

  features: Feature[] = [
    {
      icon: 'dumbbell',
      title: 'Entrenamiento Personalizado',
      description: 'Programas diseñados específicamente para tus objetivos, condición física y disponibilidad de tiempo para maximizar resultados.'
    },
    {
      icon: 'users',
      title: 'Clases Grupales Dinámicas',
      description: 'Sesiones energéticas dirigidas por expertos que combinan cardio, fuerza y flexibilidad para una experiencia completa.'
    },
    {
      icon: 'clipboard-list',
      title: 'Evaluación de Rendimiento',
      description: 'Evaluaciones periódicas de tu progreso para ajustar entrenamientos y asegurar que alcances tus metas de forma eficiente.'
    },
    {
      icon: 'utensils',
      title: 'Asesoría Nutricional',
      description: 'Implementación de planes alimenticios personalizados que complementan tu entrenamiento, garantizando resultados consistentes.'
    },
    {
      icon: 'medal',
      title: 'Preparación para Competencias',
      description: 'Asesoramiento especializado para atletas que buscan participar en competiciones, asegurando el cumplimiento de estándares y requisitos.'
    },
    {
      icon: 'heartbeat',
      title: 'Rehabilitación Deportiva',
      description: 'Implementación de protocolos de recuperación durante lesiones para garantizar un retorno seguro a la actividad física.'
    }
  ];


  constructor() { }
}

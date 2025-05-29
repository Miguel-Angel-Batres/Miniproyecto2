// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-nosotros',
//   imports: [],
//   templateUrl: './nosotros.component.html',
//   styleUrl: './nosotros.component.css'
// })
// export class NosotrosComponent {

// }

import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-nosotros',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nosotros.component.html',
  styleUrl: './nosotros.component.css'
})
export class NosotrosComponent implements OnInit, OnDestroy {
  // Variables para el menú de accesibilidad
  showAccessibilityMenu = false;
  
  // Variables para contraste
  currentContrast = 'normal';
  contrastOptions = [
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'Alto Contraste' },
    { value: 'dark', label: 'Modo Oscuro' }
  ];
  
  // Variables para tamaño de texto
  currentFontSize = 'medium';
  fontSizeOptions = [
    { value: 'small', label: 'Pequeño', size: '14px' },
    { value: 'medium', label: 'Mediano', size: '16px' },
    { value: 'large', label: 'Grande', size: '18px' },
    { value: 'xlarge', label: 'Muy Grande', size: '22px' }
  ];
  
  // Variables para tipo de fuente
  currentFont = 'default';
  fontOptions = [
    { value: 'default', label: 'Por Defecto', font: 'inherit' },
    { value: 'arial', label: 'Arial', font: 'Arial, sans-serif' },
    { value: 'verdana', label: 'Verdana', font: 'Verdana, sans-serif' },
    { value: 'roboto', label: 'Roboto', font: 'Roboto, sans-serif' }
  ];
  
  // Variables para lector de pantalla
  speechSynthesis: SpeechSynthesis | null = null;
  currentUtterance: SpeechSynthesisUtterance | null = null;
  isReading = false;
  isPaused = false;
  isBrowser = false;
  
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }
  
  ngOnInit(): void {
    if (this.isBrowser) {
      // Inicializar Speech Synthesis solo en el navegador
      if ('speechSynthesis' in window) {
        this.speechSynthesis = window.speechSynthesis;
      }
      
      // Cargar configuraciones guardadas
      this.loadAccessibilitySettings();
      this.applyAccessibilitySettings();
    }
  }
  
  ngOnDestroy(): void {
    // Detener lectura al destruir componente
    this.stopReading();
  }
  
  // Métodos para el menú de accesibilidad
  toggleAccessibilityMenu(): void {
    this.showAccessibilityMenu = !this.showAccessibilityMenu;
  }
  
  closeAccessibilityMenu(): void {
    this.showAccessibilityMenu = false;
  }
  
  // Métodos para contraste
  changeContrast(contrast: string): void {
    this.currentContrast = contrast;
    this.applyContrast();
    this.saveAccessibilitySettings();
  }
  
  private applyContrast(): void {
    if (!this.isBrowser) return;
    
    const body = document.body;
    const html = document.documentElement;
    
    // Remover clases anteriores
    body.classList.remove('high-contrast', 'dark-mode');
    html.classList.remove('high-contrast', 'dark-mode');
    
    // Aplicar nueva clase
    switch (this.currentContrast) {
      case 'high':
        body.classList.add('high-contrast');
        html.classList.add('high-contrast');
        break;
      case 'dark':
        body.classList.add('dark-mode');
        html.classList.add('dark-mode');
        break;
      default:
        // Modo normal - no agregar clases
        break;
    }
  }
  
  // Métodos para tamaño de fuente
  changeFontSize(size: string): void {
    this.currentFontSize = size;
    this.applyFontSize();
    this.saveAccessibilitySettings();
  }
  
  private applyFontSize(): void {
    if (!this.isBrowser) return;
    
    const selectedSize = this.fontSizeOptions.find(option => option.value === this.currentFontSize);
    if (selectedSize) {
      document.documentElement.style.setProperty('--accessibility-font-size', selectedSize.size);
      
      // También aplicar a elementos específicos para mejor compatibilidad
      const elements = document.querySelectorAll('.team-carousel-container, .team-carousel-container *');
      elements.forEach(element => {
        if (element instanceof HTMLElement) {
          element.style.fontSize = selectedSize.size;
        }
      });
    }
  }
  
  // Métodos para tipo de fuente
  changeFont(font: string): void {
    this.currentFont = font;
    this.applyFont();
    this.saveAccessibilitySettings();
  }
  
  private applyFont(): void {
    if (!this.isBrowser) return;
    
    const selectedFont = this.fontOptions.find(option => option.value === this.currentFont);
    if (selectedFont) {
      document.documentElement.style.setProperty('--accessibility-font-family', selectedFont.font);
      
      // También aplicar directamente al contenedor principal
      const container = document.querySelector('.team-carousel-container') as HTMLElement;
      if (container) {
        container.style.fontFamily = selectedFont.font;
      }
    }
  }
  
  // Métodos para lector de pantalla
  startReading(): void {
    if (!this.isBrowser || !this.speechSynthesis) {
      console.warn('Speech Synthesis no está disponible');
      return;
    }
    
    // Detener cualquier lectura anterior
    this.speechSynthesis.cancel();
    
    // Obtener todo el texto del componente
    const textContent = this.getComponentText();
    
    if (textContent) {
      this.currentUtterance = new SpeechSynthesisUtterance(textContent);
      this.currentUtterance.lang = 'es-ES';
      this.currentUtterance.rate = 0.7;
      this.currentUtterance.pitch = 1;
      this.currentUtterance.volume = 0.8;
      
      this.currentUtterance.onstart = () => {
        this.isReading = true;
        this.isPaused = false;
      };
      
      this.currentUtterance.onend = () => {
        this.isReading = false;
        this.isPaused = false;
      };
      
      this.currentUtterance.onerror = (event) => {
        console.error('Error en Speech Synthesis:', event);
        this.isReading = false;
        this.isPaused = false;
      };
      
      this.speechSynthesis.speak(this.currentUtterance);
    } else {
      console.warn('No se encontró contenido para leer');
    }
  }
  
  pauseReading(): void {
    if (!this.isBrowser || !this.speechSynthesis || !this.isReading) return;
    
    if (this.isPaused) {
      this.speechSynthesis.resume();
      this.isPaused = false;
    } else {
      this.speechSynthesis.pause();
      this.isPaused = true;
    }
  }
  
  stopReading(): void {
    if (!this.isBrowser || !this.speechSynthesis) return;
    
    this.speechSynthesis.cancel();
    this.isReading = false;
    this.isPaused = false;
  }
  
  private getComponentText(): string {
    if (!this.isBrowser) return '';
    
    try {
      const component = document.querySelector('.team-carousel-container');
      if (!component) return '';
      
      // Extraer texto del encabezado
      const header = component.querySelector('.nosotros-header h1')?.textContent?.trim() || '';
      const subtitle = component.querySelector('.nosotros-header h4')?.textContent?.trim() || '';
      
      // Extraer información de todos los miembros del equipo (no solo el activo)
      const allMembers = Array.from(component.querySelectorAll('.team-member-info')).map(member => {
        const name = member.querySelector('.team-member-name')?.textContent?.trim() || '';
        const position = member.querySelector('.team-member-position')?.textContent?.trim() || '';
        const description = member.querySelector('.team-member-description')?.textContent?.trim() || '';
        return `${name}, ${position}. ${description}`;
      }).filter(text => text.length > 0);
      
      const membersText = allMembers.join('. Siguiente miembro: ');
      
      return `${header}. ${subtitle}. A continuación se presenta información sobre los miembros del equipo: ${membersText}`;
    } catch (error) {
      console.error('Error al obtener texto del componente:', error);
      return 'Error al obtener el contenido para lectura';
    }
  }
  
  // Métodos para guardar y cargar configuraciones
  private saveAccessibilitySettings(): void {
    if (!this.isBrowser) return;
    
    try {
      const settings = {
        contrast: this.currentContrast,
        fontSize: this.currentFontSize,
        font: this.currentFont
      };
      localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error al guardar configuraciones:', error);
    }
  }
  
  private loadAccessibilitySettings(): void {
    if (!this.isBrowser) return;
    
    try {
      const saved = localStorage.getItem('accessibilitySettings');
      if (saved) {
        const settings = JSON.parse(saved);
        this.currentContrast = settings.contrast || 'normal';
        this.currentFontSize = settings.fontSize || 'medium';
        this.currentFont = settings.font || 'default';
      }
    } catch (error) {
      console.error('Error al cargar configuraciones:', error);
      // Usar valores por defecto en caso de error
      this.currentContrast = 'normal';
      this.currentFontSize = 'medium';
      this.currentFont = 'default';
    }
  }
  
  private applyAccessibilitySettings(): void {
    if (!this.isBrowser) return;
    
    // Usar setTimeout para asegurar que el DOM esté completamente cargado
    setTimeout(() => {
      this.applyContrast();
      this.applyFontSize();
      this.applyFont();
    }, 100);
  }
}
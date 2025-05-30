import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, ViewEncapsulation } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

// Interfaz para opciones de accesibilidad
interface FontOption {
  value: string;
  label: string;
  font: string;
  preview?: string;
}

interface FontSizeOption {
  value: string;
  label: string;
  size: string;
}

interface ContrastOption {
  value: string;
  label: string;
  icon?: string;
}

@Component({
  selector: 'app-nosotros',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nosotros.component.html',
  styleUrl: './nosotros.component.css',
  encapsulation: ViewEncapsulation.None
})
export class NosotrosComponent implements OnInit, OnDestroy {
  // Variables para el menú de accesibilidad
  showAccessibilityMenu = false;
  
  // Variables para contraste
  currentContrast = 'normal';
  contrastOptions: ContrastOption[] = [
    { value: 'normal', label: 'Normal', icon: 'sun' },
    { value: 'high', label: 'Alto Contraste', icon: 'contrast' },
    { value: 'dark', label: 'Modo Oscuro', icon: 'moon' }
  ];
  
  // Variables para tamaño de texto - Valores más extremos
  currentFontSize = 'medium';
  fontSizeOptions: FontSizeOption[] = [
    { value: 'xsmall', label: 'Muy Pequeño', size: '10px' },
    { value: 'small', label: 'Pequeño', size: '12px' },
    { value: 'medium', label: 'Mediano', size: '14px' },
    { value: 'large', label: 'Grande', size: '16px' },
    { value: 'xlarge', label: 'Muy Grande', size: '18px' }
  ];
  
  // Variables para tipo de fuente - Fuentes más distintivas
  currentFont = 'default';
  fontOptions: FontOption[] = [
    { value: 'default', label: 'Por Defecto', font: 'inherit' },
    { value: 'montserrat', label: 'Montserrat', font: "'Montserrat', sans-serif" },
    { value: 'roboto', label: 'Roboto', font: "'Roboto', sans-serif" },
    { value: 'merriweather', label: 'Merriweather', font: "'Merriweather', serif" },
    { value: 'courier', label: 'Courier', font: "'Courier New', monospace" }
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
      // Cargar fuentes web necesarias
      this.loadWebFonts();
      
      if ('speechSynthesis' in window) {
        this.speechSynthesis = window.speechSynthesis;
      }
      
      this.loadAccessibilitySettings();
      
      setTimeout(() => {
        this.applyAccessibilitySettings();
      }, 100);
    }
  }
  
  ngOnDestroy(): void {
    this.stopReading();
    
    if (this.isBrowser) {
      this.removeAllContrastClasses();
      this.removeCustomStyles();
    }
  }
  
  /**
   * Carga las fuentes web necesarias para las opciones de accesibilidad
   */
  private loadWebFonts(): void {
    // Crear un elemento link para cargar las fuentes de Google
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Open+Sans:wght@400;700&family=Roboto:wght@400;700&family=Merriweather:wght@400;700&display=swap';
    document.head.appendChild(fontLink);
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
    
    // Remover todas las clases de contraste anteriores
    this.removeAllContrastClasses();
    
    // Aplicar nueva clase según el contraste seleccionado
    switch (this.currentContrast) {
      case 'high':
        body.classList.add('high-contrast');
        html.classList.add('high-contrast');
        this.applyHighContrastStyles();
        break;
      case 'dark':
        body.classList.add('dark-mode');
        html.classList.add('dark-mode');
        this.applyDarkModeStyles();
        break;
      default:
        this.applyNormalStyles();
        break;
    }
  }
  
  private removeAllContrastClasses(): void {
    const body = document.body;
    const html = document.documentElement;
    
    body.classList.remove('high-contrast', 'dark-mode');
    html.classList.remove('high-contrast', 'dark-mode');
  }
  
  private applyHighContrastStyles(): void {
    const style = document.createElement('style');
    style.id = 'high-contrast-styles';
    style.innerHTML = `
      /* SOLO aplicar a elementos específicos, NO a todo */
      body.high-contrast {
        background: #000 !important;
        color: #fff !important;
      }
      
      /* Contenedor principal */
      body.high-contrast .team-carousel-container {
        background: #000 !important;
        color: #fff !important;
      }
      
      /* Tarjetas de miembros */
      body.high-contrast .team-member-card {
        background: #000 !important;
        border: 3px solid #fff !important;
        box-shadow: 0 0 15px #fff !important;
        color: #fff !important;
      }
      
      /* Textos específicos */
      body.high-contrast .team-member-name {
        color: #fff !important;
        text-shadow: 1px 1px 2px #000 !important;
      }
      
      body.high-contrast .team-member-position {
        color: #ffff00 !important;
        font-weight: bold !important;
        text-shadow: 1px 1px 2px #000 !important;
      }
      
      body.high-contrast .team-member-description {
        color: #fff !important;
        text-shadow: 1px 1px 1px #000 !important;
      }
      
      /* Headers */
      body.high-contrast .nosotros-header h1 {
        color: #fff !important;
        text-shadow: 2px 2px 4px #000 !important;
      }
      
      body.high-contrast .nosotros-header h4 {
        color: #ffff00 !important;
        text-shadow: 1px 1px 2px #000 !important;
      }
      
      body.high-contrast .nosotros-header h1::after {
        background-color: #fff !important;
      }
      
      body.high-contrast .divider {
        background: #fff !important;
      }
      
      /* Controles del carrusel */
      body.high-contrast .carousel-control-prev-icon,
      body.high-contrast .carousel-control-next-icon {
        background-color: #fff !important;
        border: 2px solid #000 !important;
      }
      
      body.high-contrast .carousel-indicators button {
        background-color: #fff !important;
        border: 1px solid #000 !important;
      }
      
      body.high-contrast .carousel-indicators button.active {
        background-color: #ffff00 !important;
        border: 2px solid #fff !important;
      }
      
      /* Menú de accesibilidad */
      body.high-contrast .accessibility-menu {
        background: #000 !important;
        border: 3px solid #fff !important;
        color: #fff !important;
      }
      
      body.high-contrast .accessibility-menu-header {
        background: #000 !important;
        border-bottom: 2px solid #fff !important;
        color: #fff !important;
      }
      
      body.high-contrast .accessibility-menu-header h3 {
        color: #fff !important;
      }
      
      body.high-contrast .close-btn {
        color: #fff !important;
        background: #000 !important;
        border: 1px solid #fff !important;
      }
      
      body.high-contrast .close-btn:hover {
        background: #fff !important;
        color: #000 !important;
      }
      
      body.high-contrast .accessibility-section {
        border-bottom: 1px solid #fff !important;
      }
      
      body.high-contrast .accessibility-section h4 {
        color: #ffff00 !important;
      }
      
      body.high-contrast .option-btn {
        background: #000 !important;
        color: #fff !important;
        border: 2px solid #fff !important;
      }
      
      body.high-contrast .option-btn:hover {
        background: #333 !important;
        color: #fff !important;
      }
      
      body.high-contrast .option-btn.active {
        background: #fff !important;
        color: #000 !important;
        border: 2px solid #ffff00 !important;
      }
      
      body.high-contrast .control-btn {
        background: #000 !important;
        color: #fff !important;
        border: 2px solid #fff !important;
      }
      
      body.high-contrast .control-btn:hover:not(:disabled) {
        background: #333 !important;
      }
      
      body.high-contrast .control-btn.start:not(:disabled) {
        background: #000 !important;
        color: #00ff00 !important;
        border: 2px solid #00ff00 !important;
      }
      
      body.high-contrast .control-btn.pause:not(:disabled) {
        background: #000 !important;
        color: #ffff00 !important;
        border: 2px solid #ffff00 !important;
      }
      
      body.high-contrast .control-btn.stop:not(:disabled) {
        background: #000 !important;
        color: #ff0000 !important;
        border: 2px solid #ff0000 !important;
      }
      
      /* Botón de accesibilidad */
      body.high-contrast .accessibility-toggle {
        background: #fff !important;
        color: #000 !important;
        border: 3px solid #ffff00 !important;
      }
      
      body.high-contrast .accessibility-toggle:hover {
        background: #ffff00 !important;
        color: #000 !important;
      }
      
      /* Previsualizaciones de fuente */
      body.high-contrast .font-preview {
        background: #000 !important;
        color: #fff !important;
        border: 1px solid #fff !important;
      }
    `;
    
    this.removeExistingContrastStyles();
    document.head.appendChild(style);
  }
  
  private applyDarkModeStyles(): void {
    const style = document.createElement('style');
    style.id = 'dark-mode-styles';
    style.innerHTML = `
      body.dark-mode {
        background: #1a1a1a !important;
        color: #e0e0e0 !important;
      }
      
      body.dark-mode .team-carousel-container {
        background: #1a1a1a !important;
        color: #e0e0e0 !important;
      }
      
      body.dark-mode .team-member-card {
        background: #2d2d2d !important;
        color: #e0e0e0 !important;
        border: 1px solid #444 !important;
        box-shadow: 0 10px 30px rgba(255, 255, 255, 0.1) !important;
      }
      
      body.dark-mode .team-member-name {
        color: #fff !important;
      }
      
      body.dark-mode .team-member-position {
        color: #b0b0b0 !important;
      }
      
      body.dark-mode .team-member-description {
        color: #d0d0d0 !important;
      }
      
      body.dark-mode .nosotros-header h1 {
        color: #fff !important;
      }
      
      body.dark-mode .nosotros-header h1::after {
        background-color: #fff !important;
      }
      
      body.dark-mode .nosotros-header h4 {
        color: #b0b0b0 !important;
      }
      
      body.dark-mode .divider {
        background: #444 !important;
      }
      
      body.dark-mode .carousel-control-prev-icon,
      body.dark-mode .carousel-control-next-icon {
        background-color: rgba(255, 255, 255, 0.5) !important;
      }
      
      body.dark-mode .carousel-indicators button {
        background-color: #666 !important;
      }
      
      body.dark-mode .carousel-indicators button.active {
        background-color: #fff !important;
      }
      
      body.dark-mode .accessibility-menu {
        background: #2d2d2d !important;
        border: 1px solid #444 !important;
        color: #e0e0e0 !important;
      }
      
      body.dark-mode .accessibility-menu-header {
        background: #333 !important;
        border-bottom-color: #444 !important;
        color: #e0e0e0 !important;
      }
      
      body.dark-mode .accessibility-menu-header h3 {
        color: #fff !important;
      }
      
      body.dark-mode .close-btn {
        color: #e0e0e0 !important;
      }
      
      body.dark-mode .close-btn:hover {
        background: #444 !important;
        color: #fff !important;
      }
      
      body.dark-mode .accessibility-section {
        border-bottom-color: #444 !important;
      }
      
      body.dark-mode .accessibility-section h4 {
        color: #fff !important;
      }
      
      body.dark-mode .option-btn {
        background: #3d3d3d !important;
        color: #e0e0e0 !important;
        border-color: #555 !important;
      }
      
      body.dark-mode .option-btn:hover {
        background: #4d4d4d !important;
      }
      
      body.dark-mode .option-btn.active {
        background: #007bff !important;
        color: #fff !important;
      }
      
      body.dark-mode .control-btn {
        background: #3d3d3d !important;
        color: #e0e0e0 !important;
        border-color: #555 !important;
      }
      
      body.dark-mode .control-btn:hover:not(:disabled) {
        background: #4d4d4d !important;
      }
      
      /* Previsualizaciones de fuente */
      body.dark-mode .font-preview {
        background: #3d3d3d !important;
        color: #fff !important;
        border: 1px solid #555 !important;
      }
    `;
    
    this.removeExistingContrastStyles();
    document.head.appendChild(style);
  }
  
  private applyNormalStyles(): void {
    this.removeExistingContrastStyles();
  }
  
  private removeExistingContrastStyles(): void {
    const existingHighContrast = document.getElementById('high-contrast-styles');
    const existingDarkMode = document.getElementById('dark-mode-styles');
    
    if (existingHighContrast) {
      existingHighContrast.remove();
    }
    
    if (existingDarkMode) {
      existingDarkMode.remove();
    }
  }
  
  // Métodos para tamaño de fuente - MEJORADOS
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
      
      let fontSizeStyle = document.getElementById('font-size-style');
      if (!fontSizeStyle) {
        fontSizeStyle = document.createElement('style');
        fontSizeStyle.id = 'font-size-style';
        document.head.appendChild(fontSizeStyle);
      }
      
      // Aplicar tamaños más extremos y específicos para cada elemento
      fontSizeStyle.innerHTML = `
        /* Tamaño base para todo el contenedor */
        .team-carousel-container {
          font-size: ${selectedSize.size} !important;
        }
        
        /* Tamaños específicos para diferentes elementos con mayor contraste entre ellos */
        .team-member-name {
          font-size: calc(${selectedSize.size} * 1.5) !important;
          letter-spacing: 0.5px !important;
        }
        
        .team-member-position {
          font-size: calc(${selectedSize.size} * 1.2) !important;
          letter-spacing: 0.3px !important;
        }
        
        .team-member-description {
          font-size: ${selectedSize.size} !important;
          line-height: 1.6 !important;
        }
        
        .nosotros-header h1 {
          font-size: calc(${selectedSize.size} * 2) !important;
          letter-spacing: 1px !important;
        }
        
        .nosotros-header h4 {
          font-size: calc(${selectedSize.size} * 1.2) !important;
          line-height: 1.5 !important;
        }
        
        /* Ajustes para el menú de accesibilidad */
        .accessibility-menu-header h3 {
          font-size: calc(${selectedSize.size} * 1.2) !important;
        }
        
        .accessibility-section h4 {
          font-size: ${selectedSize.size} !important;
        }
        
        .option-btn, .control-btn {
          font-size: calc(${selectedSize.size} * 0.9) !important;
        }
        
        /* Ajuste para la previsualización de fuentes */
        .font-preview {
          font-size: calc(${selectedSize.size} * 1.2) !important;
        }
      `;
    }
  }
  
  // Métodos para tipo de fuente - MEJORADOS
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
      
      let fontFamilyStyle = document.getElementById('font-family-style');
      if (!fontFamilyStyle) {
        fontFamilyStyle = document.createElement('style');
        fontFamilyStyle.id = 'font-family-style';
        document.head.appendChild(fontFamilyStyle);
      }
      
      // Aplicar la fuente con características específicas para hacerla más distintiva
      fontFamilyStyle.innerHTML = `
        /* Aplicar la fuente a todo el contenedor */
        .team-carousel-container {
          font-family: ${selectedFont.font} !important;
        }
        
        /* Características específicas para diferentes elementos */
        .team-member-name {
          font-family: ${selectedFont.font} !important;
          font-weight: 700 !important;
        }
        
        .team-member-position {
          font-family: ${selectedFont.font} !important;
          font-style: ${selectedFont.value === 'merriweather' ? 'italic' : 'normal'} !important;
        }
        
        .team-member-description {
          font-family: ${selectedFont.font} !important;
          font-weight: 400 !important;
          ${selectedFont.value === 'dyslexic' ? 'letter-spacing: 0.5px !important; word-spacing: 2px !important;' : ''}
        }
        
        .nosotros-header h1 {
          font-family: ${selectedFont.font} !important;
          font-weight: 700 !important;
          ${selectedFont.value === 'montserrat' ? 'text-transform: uppercase !important;' : ''}
        }
        
        .nosotros-header h4 {
          font-family: ${selectedFont.font} !important;
          ${selectedFont.value === 'merriweather' ? 'font-style: italic !important;' : ''}
        }
        
        /* Aplicar también al menú de accesibilidad para consistencia */
        .accessibility-menu {
          font-family: ${selectedFont.font} !important;
        }
        
        /* Estilo para la previsualización de fuentes */
        .font-preview {
          font-family: ${selectedFont.font} !important;
        }
      `;
    }
  }
  
  // Métodos para lector de pantalla
  startReading(): void {
    if (!this.isBrowser || !this.speechSynthesis) {
      console.warn('Speech Synthesis no está disponible');
      return;
    }
    
    this.speechSynthesis.cancel();
    
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
      
      const header = component.querySelector('.nosotros-header h1')?.textContent?.trim() || '';
      const subtitle = component.querySelector('.nosotros-header h4')?.textContent?.trim() || '';
      
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
        font: this.currentFont,
        timestamp: new Date().getTime()
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
      this.currentContrast = 'normal';
      this.currentFontSize = 'medium';
      this.currentFont = 'default';
    }
  }
  
  private applyAccessibilitySettings(): void {
    if (!this.isBrowser) return;
    
    setTimeout(() => {
      this.applyContrast();
      this.applyFontSize();
      this.applyFont();
    }, 200);
  }
  
  /**
   * Elimina todos los estilos personalizados al destruir el componente
   */
  private removeCustomStyles(): void {
    const fontSizeStyle = document.getElementById('font-size-style');
    const fontFamilyStyle = document.getElementById('font-family-style');
    
    if (fontSizeStyle) {
      fontSizeStyle.remove();
    }
    
    if (fontFamilyStyle) {
      fontFamilyStyle.remove();
    }
  }
}
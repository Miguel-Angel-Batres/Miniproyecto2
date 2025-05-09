export interface Plan {
    nombre: string;
    precio: number;
    beneficios: string[];
    fechaInicio?: string;
    fechaFin?: string;
    estado: string;
    descripcion: string; 
    tipo: string; 
  }
  
  // Lista de planes predefinidos
  export const PLANES: Plan[] = [
    {
      nombre: 'Básico',
      precio: 29.99,
      beneficios: [
        'Acceso a área de pesas',
        'Acceso a cardio',
        'Horario limitado (6AM - 8PM)',
        '2 clases grupales por semana',
        'Casillero estándar'
      ],
      tipo: 'mensual',
      fechaInicio: '',
      fechaFin: '',
      estado: 'Disponible',
      descripcion: 'Plan básico para quienes buscan un entrenamiento sencillo y efectivo.'
    },
    {
      nombre: 'Pro',
      precio: 49.99,
      beneficios: [
        'Todas las áreas del gimnasio',
        'Clases ilimitadas',
        '1 sesión mensual con entrenador',
        'Casillero premium',
        'Acceso a sauna y spa',
        'Estacionamiento gratuito'
      ],
      tipo: 'mensual',
      fechaInicio: '',
      fechaFin: '',
      estado: 'Disponible',
      descripcion: 'Plan premium para quienes buscan un entrenamiento completo y personalizado.'
    }
  ];
  
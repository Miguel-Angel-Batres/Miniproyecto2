export interface Pago {
    titular: string;
    monto: number;
    tarjeta: string;
    fechaPago: string;
    metodo: string;
    banco: string;
    terminos: boolean;
    duracion: number;
    plan: string;
  }
  
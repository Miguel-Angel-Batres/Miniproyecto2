import { Component, Input } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);
import { ChartData, ChartOptions, ChartType } from 'chart.js';

@Component({
  selector: 'app-grafico',
  templateUrl: './grafico.component.html',
  styleUrls: ['./grafico.component.css'],
  imports: [BaseChartDirective],
  standalone: true,
})
export class GraficoComponent {
  @Input() GraficaPastel!: ChartData<'pie'>;
  @Input() graficaUsuariosPorFecha!: ChartData<'line'>;
  @Input() graficaIngresosPorMes!: ChartData<'bar'>;
 
}

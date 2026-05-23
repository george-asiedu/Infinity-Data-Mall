import { Component, input, output } from '@angular/core';
import { TableColumn } from '../../../core/models/utility.model';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-table',
  imports: [TableModule],
  templateUrl: './table.html',
  styleUrl: './table.css',
})
export class Table {
  public data = input<Record<string, unknown>[]>([]);
  public columns = input<TableColumn[]>([]);
  public paginator = input<boolean>(true);
  public rows = input<number>(10);
  public customClass = input<string>('surface-card');

  public rowSelected = output<Record<string, unknown>>();
}

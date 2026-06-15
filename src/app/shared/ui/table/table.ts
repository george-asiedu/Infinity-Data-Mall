import { Component, input, output, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableColumn } from '../../../core/models/utility.model';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-table',
  imports: [CommonModule, TableModule],
  templateUrl: './table.html',
  styleUrl: './table.css',
})
export class Table {
  public data = input<Record<string, unknown>[]>([]);
  public columns = input<TableColumn[]>([]);
  public paginator = input<boolean>(true);
  public rows = input<number>(15);
  public rowsPerPageOptions = input<number[]>([15, 30, 50]);
  public customClass = input<string>('surface-card');
  public dataKey = input<string>('id');

  // Dynamic empty state (reusable across packages, orders, etc.).
  public emptyIcon = input<string>('📦');
  public emptyTitle = input<string>('No data available');
  public emptyMessage = input<string>('');

  /**
   * Optional per-column body templates, keyed by column field. Each template is
   * rendered with context { $implicit: row, row, col }. Columns without a
   * template fall back to plain text.
   */
  public cellTemplates = input<Record<string, TemplateRef<unknown>>>({});

  public rowSelected = output<Record<string, unknown>>();

  protected templateFor(field: string): TemplateRef<unknown> | null {
    return this.cellTemplates()[field] ?? null;
  }

  protected alignClass(col: TableColumn): string {
    if (col.align === 'center') return 'text-center';
    if (col.align === 'right') return 'text-right';
    return 'text-left';
  }
}

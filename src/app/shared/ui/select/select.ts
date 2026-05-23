import { Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-select',
  imports: [SelectModule, FormsModule],
  templateUrl: './select.html',
  styleUrl: './select.css',
})
export class Select<T> {
  public value = model<T | null>(null);
  public options = input<T[]>([]);
  public optionLabel = input<string>('label');
  public optionValue = input<string>('value');
  public placeholder = input<string>('Select an option');
  public disabled = input<boolean>(false);
  public customClass = input<string>('w-full control-base');

  public selectionChanged = output<T>();
}

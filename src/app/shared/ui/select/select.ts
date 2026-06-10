import { Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-select',
  imports: [SelectModule, FormsModule, FloatLabelModule],
  templateUrl: './select.html',
  styleUrl: './select.css',
})
export class Select<T> {
  public id = input<string>('');
  public label = input<string>('');
  public value = model<T | null>(null);
  public options = input<T[]>([]);
  public optionLabel = input<string>('label');
  public optionValue = input<string>('value');
  public placeholder = input<string>('');
  public disabled = input<boolean>(false);
  public customClass = input<string>('w-full');

  public filter = input<boolean>(false);
  public filterBy = input<string>('label');
  public selectionChanged = output<T>();
}

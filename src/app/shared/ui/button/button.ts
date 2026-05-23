import { Component, input, output } from '@angular/core';
import { ButtonModule, ButtonSeverity } from 'primeng/button';

@Component({
  selector: 'app-button',
  imports: [ButtonModule],
  templateUrl: './button.html',
  styleUrl: './button.css',
})
export class Button {
  public label = input<string>('');
  public icon = input<string>('');
  public iconPos = input<'left' | 'right'>('left');
  public severity = input<ButtonSeverity>('primary');
  public outlined = input<boolean>(false);
  public rounded = input<boolean>(true);
  public raised = input<boolean>(false);
  public loading = input<boolean>(false);
  public disabled = input<boolean>(false);
  public customClass = input<string>('');

  public clicked = output<Event>();
}

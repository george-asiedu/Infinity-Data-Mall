import { Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputOtpModule } from 'primeng/inputotp';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { TextareaModule } from 'primeng/textarea';
import { InputVariant } from '../../../core/models/utility.model';
import { FloatLabelModule } from 'primeng/floatlabel';

@Component({
  selector: 'app-input',
  imports: [
    FormsModule,
    InputTextModule,
    InputNumberModule,
    PasswordModule,
    TextareaModule,
    InputOtpModule,
    FloatLabelModule,
  ],
  templateUrl: './input.html',
  styleUrl: './input.css',
})
export class Input {
  public value = model<string | number>('');
  public label = input<string>('');
  public id = input<string>('');

  public type = input<InputVariant>('text');
  public placeholder = input<string>('');
  public disabled = input<boolean>(false);
  public customClass = input<string>('w-full control-base');

  public useGrouping = input<boolean>(true);
  public toggleMask = input<boolean>(true);
  public feedback = input<boolean>(false);
  public rows = input<number>(3);
  public autoResize = input<boolean>(true);
  public otpLength = input<number>(6);
}

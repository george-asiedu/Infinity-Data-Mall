/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, forwardRef, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
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
    CommonModule,
    InputTextModule,
    InputNumberModule,
    PasswordModule,
    TextareaModule,
    InputOtpModule,
    FloatLabelModule,
  ],
  templateUrl: './input.html',
  styleUrl: './input.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Input),
      multi: true,
    },
  ],
})
export class Input implements ControlValueAccessor {
  public label = input<string>('');
  public id = input<string>('');
  public required = input<boolean>(false);
  public type = input<InputVariant>('text');
  public placeholder = input<string>('');
  public customClass = input<string>('w-full control-base');
  public invalid = input<boolean>(false);

  public useGrouping = input<boolean>(true);
  public toggleMask = input<boolean>(true);
  public feedback = input<boolean>(false);
  public rows = input<number>(3);
  public autoResize = input<boolean>(true);
  public otpLength = input<number>(6);

  protected innerValue: any = '';
  protected isDisabled = signal<boolean>(false);
  protected onChange: (value: any) => void = () => {
    /* empty */
  };
  protected onTouched: () => void = () => {
    /* empty */
  };
  public writeValue(value: any): void {
    this.innerValue = value ?? '';
  }
  public registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  public setDisabledState?(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  protected handleValueChange(newValue: any): void {
    this.innerValue = newValue;
    this.onChange(newValue);
  }
}

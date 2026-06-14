import { Component, computed, input, model, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { Button } from '../button/button';

/**
 * Reusable amount-entry modal. Drives a PrimeNG dialog with a currency input,
 * optional quick-amount presets, and min/max validation. Two-way bound via
 * `visible`; emits the entered amount through `confirm`. The parent owns the
 * async work and closes the dialog by setting `visible` to false on success.
 */
@Component({
  selector: 'app-amount-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, InputNumberModule, Button],
  templateUrl: './amount-dialog.html',
  styleUrl: './amount-dialog.css',
})
export class AmountDialog {
  public readonly visible = model<boolean>(false);

  public readonly header = input<string>('Enter amount');
  public readonly subheader = input<string>('');
  public readonly icon = input<string>('pi pi-wallet');
  public readonly confirmLabel = input<string>('Confirm');
  public readonly confirmIcon = input<string>('');
  public readonly currency = input<string>('GHS');
  public readonly min = input<number>(1);
  public readonly max = input<number | null>(null);
  public readonly presets = input<number[]>([]);
  public readonly helperText = input<string>('');
  public readonly loading = input<boolean>(false);

  public readonly confirm = output<number>();

  protected readonly amount = signal<number | null>(null);
  protected readonly touched = signal<boolean>(false);

  protected readonly error = computed<string | null>(() => {
    const value = this.amount();
    if (value === null || value === undefined) return 'Please enter an amount';
    if (value < this.min()) {
      return `Minimum amount is ${this.currency()} ${this.min()}`;
    }
    const max = this.max();
    if (max !== null && value > max) {
      return `You can withdraw at most ${this.currency()} ${max}`;
    }
    return null;
  });

  protected readonly showError = computed<boolean>(() => this.touched() && this.error() !== null);

  protected applyPreset(value: number): void {
    this.amount.set(value);
    this.touched.set(true);
  }

  protected onConfirm(): void {
    this.touched.set(true);
    if (this.error() !== null) return;
    this.confirm.emit(this.amount() as number);
  }

  protected onHide(): void {
    this.amount.set(null);
    this.touched.set(false);
  }

  protected isPresetDisabled(value: number): boolean {
    const max = this.max();
    return max !== null && value > max;
  }
}

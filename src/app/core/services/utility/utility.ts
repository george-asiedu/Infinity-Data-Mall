import { inject, Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { validationMessages } from '../../../shared/utils/constants';
import { Toast } from '../toast/toast';

@Injectable({
  providedIn: 'root',
})
export class Utility {
  private toast = inject(Toast);

  public getErrorMessage(control: AbstractControl | null, controlName: string): string {
    if (!control || !control.invalid || !(control.touched || control.dirty)) {
      return '';
    }

    const messages = validationMessages[controlName];

    if (!messages) {
      return 'Invalid value.';
    }

    for (const errorKey in control.errors) {
      if (Object.prototype.hasOwnProperty.call(control.errors, errorKey) && messages[errorKey]) {
        return messages[errorKey];
      }
    }

    return 'Invalid value.';
  }

  public shouldShowError(control: AbstractControl | null): boolean {
    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  public copyToClipboard(copyItem: string): void {
    navigator.clipboard
      .writeText(copyItem)
      .then(() => {
        this.toast.info('Copied to clipboard!');
      })
      .catch((err) => {
        this.toast.error('Could not copy text to clipboard.');
        console.error('Could not copy text: ', err);
      });
  }

  public generateUniqueReference(): string {
    const timestamp = Date.now().toString(36);
    const randomChars = Math.random().toString(36).substring(2, 10);
    return `REF-${timestamp}-${randomChars}`.toUpperCase();
  }

  /**
   * Safely defers code execution to a separate macro-task thread.
   * @param ms The duration to delay in milliseconds (defaults to 0 for a simple event-loop deferral).
   */
  public delay = (ms = 0): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };
}

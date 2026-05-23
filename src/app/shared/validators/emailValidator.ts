import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function emailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,4})$/;
    const isValidEmail = emailPattern.test(control.value);

    return isValidEmail ? null : { invalidEmail: true };
  };
}

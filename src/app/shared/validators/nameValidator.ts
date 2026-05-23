import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const nameValidator = (): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value.trim();
    const isValid = /^[a-zA-Z]+(?: [a-zA-Z]+)*$/.test(value);
    return isValid ? null : { invalidName: true };
  };
};

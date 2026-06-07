/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, computed, DestroyRef, effect, inject, OnInit, signal } from '@angular/core';
import { Input } from '../../../shared/ui/input/input';
import { Button } from '../../../shared/ui/button/button';
import { CommonModule } from '@angular/common';
import { FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { paymentActions } from '../store/payment.actions';
import {
  selectBanks,
  selectError,
  selectIsLoading,
  selectPaymentState,
  selectSetup,
} from '../store/payment.selectors';
import { Select } from '../../../shared/ui/select/select';
import { Skeleton } from '../../../shared/ui/skeleton/skeleton';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

@Component({
  selector: 'app-onboarding',
  imports: [CommonModule, ReactiveFormsModule, Input, Button, Select, Skeleton],
  templateUrl: './onboarding.html',
  styleUrl: './onboarding.css',
})
export class Onboarding implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly store = inject(Store);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly hasVendorKey = signal<boolean>(false);
  protected readonly isLoading = this.store.selectSignal(selectIsLoading);
  protected readonly apiError = this.store.selectSignal(selectError);
  protected readonly setupSuccess = this.store.selectSignal(selectSetup);

  protected readonly banks = this.store.selectSignal(selectBanks);
  private readonly paymentState = this.store.selectSignal(selectPaymentState);

  protected readonly verifiedAccountName = computed(() => {
    const state = this.paymentState() as any;
    const currentInputNumber = this.setupForm?.get('accountNumber')?.value?.trim();

    if (state?.response?.data?.account_number === currentInputNumber) {
      return state?.response?.data?.account_name || null;
    }
    return null;
  });

  protected setupForm: FormGroup = this.fb.group({
    businessName: ['', [Validators.required, Validators.minLength(3)]],
    bankCode: ['', [Validators.required]],
    accountNumber: ['', [Validators.required, Validators.pattern('^[0-9]{9,13}$')]],
    vendorApiKey: [''],
  });

  constructor() {
    effect(() => {
      const errorExist = this.apiError();
      const successExist = this.setupSuccess();

      if (errorExist || successExist) {
        const timer = setTimeout(() => {
          this.store.dispatch(paymentActions.clearPaymentState());
        }, 6000);

        return () => clearTimeout(timer);
      }
      return undefined;
    });

    effect(() => {
      const vendorControl = this.setupForm.get('vendorApiKey');
      if (this.hasVendorKey()) {
        vendorControl?.setValidators([Validators.required, Validators.minLength(10)]);
      } else {
        vendorControl?.clearValidators();
        vendorControl?.setValue('');
      }
      vendorControl?.updateValueAndValidity({ emitEvent: false });
    });
  }

  ngOnInit(): void {
    this.store.dispatch(paymentActions.clearPaymentState());
    this.store.dispatch(paymentActions.getBanks());
    this.trackAccountNumberVerification();
  }

  private trackAccountNumberVerification(): void {
    this.setupForm.valueChanges
      .pipe(
        debounceTime(600),
        map((values) => ({
          accountNumber: values.accountNumber?.trim(),
          bankCode: values.bankCode,
        })),
        distinctUntilChanged(
          (prev, curr) =>
            prev.accountNumber === curr.accountNumber && prev.bankCode === curr.bankCode,
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ accountNumber, bankCode }) => {
        const accountControl = this.setupForm.get('accountNumber');

        if (
          accountNumber &&
          accountNumber.length >= 9 &&
          accountNumber.length <= 13 &&
          accountControl?.valid &&
          bankCode
        ) {
          const model = {
            accountNumber: accountNumber,
            bankCode: bankCode,
          };
          this.store.dispatch(paymentActions.verifyBankAccount({ model }));
        }
      });
  }

  protected toggleVendorKeyOption(value: boolean): void {
    this.hasVendorKey.set(value);
  }

  protected onSubmit(): void {
    if (this.setupForm.invalid) {
      this.setupForm.markAllAsTouched();
      return;
    }

    const rawValues = this.setupForm.getRawValue();
    const model = {
      businessName: rawValues.businessName.trim(),
      bankCode: rawValues.bankCode,
      accountNumber: rawValues.accountNumber.trim(),
      vendorApiKey: this.hasVendorKey() ? rawValues.vendorApiKey.trim() : null,
    };

    this.store.dispatch(paymentActions.completeSetup({ model }));
  }

  protected getControl(name: string) {
    return this.setupForm.get(name);
  }
}

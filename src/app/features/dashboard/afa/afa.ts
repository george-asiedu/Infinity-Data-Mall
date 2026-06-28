import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Xpress } from '../xpress/service/xpress';
import { Toast } from '../../../core/services/toast/toast';
import { AfaRegisterModel } from '../../../core/models/xpress.model';

@Component({
  selector: 'app-afa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './afa.html',
  styleUrl: './afa.css',
})
export class AfaPage {
  private readonly xpress = inject(Xpress);
  private readonly toast = inject(Toast);

  protected readonly submitting = signal<boolean>(false);

  protected readonly form = signal<AfaRegisterModel>({
    name: '',
    phoneNumber: '',
    idNumber: '',
    location: '',
    region: '',
    dateOfBirth: '',
    occupation: '',
  });

  protected patch<K extends keyof AfaRegisterModel>(key: K, value: AfaRegisterModel[K]): void {
    this.form.update((f) => ({ ...f, [key]: value }));
  }

  protected submit(): void {
    const f = this.form();
    if (f.name.trim().length < 2) {
      this.toast.info('Enter the full name.');
      return;
    }
    // AFA accepts MTN numbers only.
    if (!/^0\d{9}$/.test(f.phoneNumber.trim())) {
      this.toast.info('Enter a valid 10-digit MTN number (e.g. 0241234567).');
      return;
    }
    if (!/^GHA-\d{9}-\d$/.test(f.idNumber.trim())) {
      this.toast.info('Ghana Card must look like GHA-XXXXXXXXX-X.');
      return;
    }
    if (!f.location.trim() || !f.region.trim()) {
      this.toast.info('Location and region are required.');
      return;
    }

    this.submitting.set(true);
    this.xpress
      .registerAfa({
        name: f.name.trim(),
        phoneNumber: f.phoneNumber.trim(),
        idNumber: f.idNumber.trim(),
        location: f.location.trim(),
        region: f.region.trim(),
        dateOfBirth: f.dateOfBirth?.trim() || undefined,
        occupation: f.occupation?.trim() || undefined,
      })
      .subscribe({
        next: (res) => {
          this.submitting.set(false);
          const fee = res.data?.registrationPrice;
          this.toast.success(fee ? `${res.message} · Fee GHS ${fee}` : res.message);
          this.reset();
        },
        error: (err) => {
          this.submitting.set(false);
          this.toast.error(err?.error?.message ?? 'AFA registration failed.');
        },
      });
  }

  private reset(): void {
    this.form.set({
      name: '',
      phoneNumber: '',
      idNumber: '',
      location: '',
      region: '',
      dateOfBirth: '',
      occupation: '',
    });
  }
}

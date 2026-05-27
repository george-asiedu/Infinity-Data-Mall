import { inject, Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ToastOptions, ToastSeverity } from '../../models/utility.model';
import { Utility } from '../utility/utility';

@Injectable({
  providedIn: 'root',
})
export class Toast {
  private messageService = inject(MessageService);
  private utilityService = inject(Utility);

  private async show(
    severity: ToastSeverity,
    detail: string,
    options: ToastOptions = {},
  ): Promise<void> {
    const defaultSummaries: Record<ToastSeverity, string> = {
      success: 'Success',
      info: 'Info',
      warn: 'Warning',
      error: 'Error',
      secondary: 'Notice',
      contrast: 'Notice',
    };

    await this.utilityService.delay(0);

    this.messageService.add({
      severity,
      summary: options.summary ?? defaultSummaries[severity],
      detail,
      life: options.sticky ? undefined : (options.life ?? 4000),
      sticky: options.sticky ?? false,
      closable: options.closable ?? true,
    });
  }

  public async success(detail: string, options?: ToastOptions): Promise<void> {
    await this.show('success', detail, options);
  }

  public async info(detail: string, options?: ToastOptions): Promise<void> {
    await this.show('info', detail, options);
  }

  public async warn(detail: string, options?: ToastOptions): Promise<void> {
    await this.show('warn', detail, options);
  }

  public async error(detail: string, options?: ToastOptions): Promise<void> {
    await this.show('error', detail, { life: 6000, ...options });
  }

  public httpError(err: unknown, fallback = 'An unexpected error occurred.'): void {
    if (fallback && fallback !== 'An unexpected error occurred.') {
      this.error(fallback);
      return;
    }

    let message = fallback;

    if (err && typeof err === 'object') {
      const e = err as Record<string, unknown>;
      if (typeof e['message'] === 'string') message = e['message'];
      else if (typeof e['error'] === 'object' && e['error']) {
        const inner = e['error'] as Record<string, unknown>;
        if (typeof inner['message'] === 'string') message = inner['message'];
      }
    }

    this.error(message);
  }

  clear(): void {
    this.messageService.clear();
  }
}

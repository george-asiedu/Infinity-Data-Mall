import { inject, Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ToastOptions, ToastSeverity } from '../../models/utility.model';

@Injectable({
  providedIn: 'root',
})
export class Toast {
  private messageService = inject(MessageService);

  private show(severity: ToastSeverity, detail: string, options: ToastOptions = {}): void {
    const defaultSummaries: Record<ToastSeverity, string> = {
      success: 'Success',
      info: 'Info',
      warn: 'Warning',
      error: 'Error',
      secondary: 'Notice',
      contrast: 'Notice',
    };

    this.messageService.add({
      severity,
      summary: options.summary ?? defaultSummaries[severity],
      detail,
      life: options.sticky ? undefined : (options.life ?? 4000),
      sticky: options.sticky ?? false,
      closable: options.closable ?? true,
    });
  }

  public success(detail: string, options?: ToastOptions): void {
    this.show('success', detail, options);
  }

  public info(detail: string, options?: ToastOptions): void {
    this.show('info', detail, options);
  }

  public warn(detail: string, options?: ToastOptions): void {
    this.show('warn', detail, options);
  }

  public error(detail: string, options?: ToastOptions): void {
    this.show('error', detail, { life: 6000, ...options });
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

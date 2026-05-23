import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Loader } from './shared/components/loader/loader';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Loader, Toast],
  templateUrl: './app.html',
  providers: [MessageService],
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('infinity-data-mall');

  severityIcon(severity: string): string {
    const icons: Record<string, string> = {
      success: 'pi pi-check-circle',
      info: 'pi pi-info-circle',
      warn: 'pi pi-exclamation-triangle',
      error: 'pi pi-times-circle',
      secondary: 'pi pi-bell',
      contrast: 'pi pi-bell',
    };
    return icons[severity] ?? 'pi pi-bell';
  }
}

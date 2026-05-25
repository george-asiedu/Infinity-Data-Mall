import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Loader } from './shared/components/loader/loader';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Theme } from './core/services/theme/theme';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Loader, Toast],
  templateUrl: './app.html',
  providers: [MessageService],
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly title = signal('infinity-data-mall');
  private readonly themeService = inject(Theme);

  ngOnInit(): void {
    this.themeService.currentTheme();
  }

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

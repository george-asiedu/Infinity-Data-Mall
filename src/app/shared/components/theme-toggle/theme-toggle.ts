import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Theme } from '../../../core/services/theme/theme';

@Component({
  selector: 'app-theme-toggle',
  imports: [ButtonModule],
  templateUrl: './theme-toggle.html',
  styleUrl: './theme-toggle.css',
})
export class ThemeToggle {
  private themeService = inject(Theme);

  isDark = this.themeService.isDark;

  toggle() {
    this.themeService.toggleTheme();
  }
}

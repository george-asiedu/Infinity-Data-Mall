import { effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { constants } from '../../../shared/utils/constants';
import { isPlatformBrowser } from '@angular/common';
import { ThemeMode } from '../../models/utility.model';

@Injectable({
  providedIn: 'root',
})
export class Theme {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly THEME_KEY = constants.themeKey;
  public readonly currentTheme = signal<ThemeMode>(this.getInitialTheme());
  public readonly isDark = () => this.currentTheme() === 'dark';

  constructor() {
    this.setupThemeSync();
  }

  private getInitialTheme(): ThemeMode {
    if (!isPlatformBrowser(this.platformId)) return 'light';

    const savedTheme = localStorage.getItem(this.THEME_KEY) as ThemeMode | null;
    if (savedTheme) return savedTheme;

    const systemDefault = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';

    localStorage.setItem(this.THEME_KEY, systemDefault);
    return systemDefault;
  }

  private setupThemeSync(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    effect(() => {
      const theme = this.currentTheme();
      const html = document.documentElement;

      if (theme === 'dark') {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }

      localStorage.setItem(this.THEME_KEY, theme);
    });

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      if (!localStorage.getItem(this.THEME_KEY)) {
        this.currentTheme.set(e.matches ? 'dark' : 'light');
      }
    });
  }

  public toggleTheme(): void {
    this.currentTheme.update((prev) => (prev === 'light' ? 'dark' : 'light'));
  }

  public setTheme(theme: ThemeMode): void {
    this.currentTheme.set(theme);
  }
}

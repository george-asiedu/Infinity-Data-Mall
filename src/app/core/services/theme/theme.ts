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
  public readonly currentTheme = signal<ThemeMode>('light');
  public readonly isDark = () => this.currentTheme() === 'dark';

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const savedTheme = localStorage.getItem(this.THEME_KEY) as ThemeMode | null;
    let initialTheme: ThemeMode = 'light';

    if (savedTheme) {
      initialTheme = savedTheme;
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      initialTheme = 'dark';
    }

    this.currentTheme.set(initialTheme);
    this.applyTheme(initialTheme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      if (!localStorage.getItem(this.THEME_KEY)) {
        this.currentTheme.set(e.matches ? 'dark' : 'light');
      }
    });

    effect(() => {
      const theme = this.currentTheme();
      this.applyTheme(theme);
      localStorage.setItem(this.THEME_KEY, theme);
    });
  }

  private applyTheme(theme: ThemeMode): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const html = document.documentElement;

    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }

  public toggleTheme(): void {
    const newTheme = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.currentTheme.set(newTheme);
  }

  public setTheme(theme: ThemeMode): void {
    this.currentTheme.set(theme);
  }

  public getSystemPreference(): ThemeMode {
    if (!isPlatformBrowser(this.platformId)) return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}

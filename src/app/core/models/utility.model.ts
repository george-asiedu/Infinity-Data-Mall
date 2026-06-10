export type ToastSeverity = 'success' | 'info' | 'warn' | 'error' | 'secondary' | 'contrast';
export type ThemeMode = 'light' | 'dark';
export type InputVariant = 'text' | 'number' | 'password' | 'textarea' | 'otp';

export interface ToastOptions {
  summary?: string;
  life?: number;
  sticky?: boolean;
  closable?: boolean;
}

export interface TableColumn {
  field: string;
  header: string;
}

export interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
}

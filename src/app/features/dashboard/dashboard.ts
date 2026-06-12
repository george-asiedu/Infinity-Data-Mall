import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { authActions } from '../auth/store/auth.actions';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../../shared/components/sidebar/sidebar';
import { Header } from '../../shared/components/header/header';
import { selectUser } from '../auth/store/auth.selectors';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterOutlet, Sidebar, Header],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private store = inject(Store);

  protected isSidebarOpen = signal<boolean>(false);
  protected user = this.store.selectSignal(selectUser);

  protected readonly activeSub = signal({
    planName: 'Active · GHS 100/mo',
    timeLeftStr: '21 days left',
    percentageLeft: 70,
  });

  protected toggleMobileSidebar(): void {
    this.isSidebarOpen.update((val) => !val);
  }

  protected handleLogoutAction(): void {
    this.store.dispatch(authActions.logout());
  }
}

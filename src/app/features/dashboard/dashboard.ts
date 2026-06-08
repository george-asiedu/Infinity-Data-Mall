import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { Toast } from '../../core/services/toast/toast';
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
export class Dashboard implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private toast = inject(Toast);
  private store = inject(Store);

  protected isSidebarOpen = signal<boolean>(false);
  protected user = this.store.selectSignal(selectUser);

  protected readonly activeSub = signal({
    planName: 'Active · GHS 100/mo',
    timeLeftStr: '21 days left',
    percentageLeft: 70,
  });

  ngOnInit(): void {
    const hashTokens = this.route.snapshot.queryParamMap.has('access_token');

    if (hashTokens) {
      this.toast.success('Successfully authenticated via Google');
      this.router.navigate([], {
        queryParams: { access_token: null, refresh_token: null, is_new: null },
        queryParamsHandling: 'merge',
      });
    }
  }

  protected toggleMobileSidebar(): void {
    this.isSidebarOpen.update((val) => !val);
  }

  protected handleLogoutAction(): void {
    this.store.dispatch(authActions.logout());
  }
}

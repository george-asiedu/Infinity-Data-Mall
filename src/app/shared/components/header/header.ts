import { CommonModule } from '@angular/common';
import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { PopoverModule } from 'primeng/popover';
import { filter } from 'rxjs';
import { authActions } from '../../../features/auth/store/auth.actions';
import { User } from '../../../core/models/auth.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, BreadcrumbModule, PopoverModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly store = inject(Store);

  public user = input<User | null>(null);
  public toggleSidebar = output<void>();

  protected userInitials(): string {
    const name = this.user()?.fullName || '';
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    return parts.length > 1
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : parts[0][0].toUpperCase();
  }

  protected breadcrumbItems = signal<MenuItem[]>([]);

  ngOnInit(): void {
    this.breadcrumbItems.set(this.buildBreadcrumbs(this.activatedRoute.root));

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.breadcrumbItems.set(this.buildBreadcrumbs(this.activatedRoute.root));
    });
  }

  private buildBreadcrumbs(
    route: ActivatedRoute,
    url = '',
    breadcrumbs: MenuItem[] = [],
  ): MenuItem[] {
    const children: ActivatedRoute[] = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeURL: string = child.snapshot.url.map((segment) => segment.path).join('/');
      if (routeURL !== '') {
        url += `/${routeURL}`;
      }

      const label = child.snapshot.data['breadcrumb'] || this.capitalize(routeURL);

      if (label && !breadcrumbs.some((b) => b.label === label)) {
        breadcrumbs.push({ label, routerLink: routeURL ? url : undefined });
      }

      return this.buildBreadcrumbs(child, url, breadcrumbs);
    }

    return breadcrumbs;
  }

  private capitalize(value: string): string {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  protected onLogout(): void {
    this.store.dispatch(authActions.logout());
  }
}

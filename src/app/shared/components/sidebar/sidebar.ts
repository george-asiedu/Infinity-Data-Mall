/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, input, model, output, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DrawerModule } from 'primeng/drawer';
import { NavItem } from '../../../core/models/utility.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, DrawerModule, NgOptimizedImage],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  public visible = model<boolean>(false);
  public subscription = input<any | null>(null);
  public logout = output<void>();

  protected readonly menuGroups = signal<NavItem[]>([
    { label: 'Dashboard', icon: 'pi pi-home', route: '/dashboard' },
    { label: 'Orders', icon: 'pi pi-shopping-bag', route: '/orders', badge: 0 },
    { label: 'Packages', icon: 'pi pi-box', route: '/packages' },
    { label: 'Wallet', icon: 'pi pi-wallet', route: '/wallet' },
    { label: 'Transactions', icon: 'pi pi-money-bill', route: '/transactions' },
    { label: 'My Shop', icon: 'pi pi-shop', route: '/my-shop' },
    { label: 'Sub-agents', icon: 'pi pi-users', route: '/sub-agents' },
    { label: 'Reports', icon: 'pi pi-chart-bar', route: '/reports' },
  ]);

  protected closeSidebar(): void {
    this.visible.set(false);
  }

  protected triggerLogout(): void {
    this.closeSidebar();
    this.logout.emit();
  }
}

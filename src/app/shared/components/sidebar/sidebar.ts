/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, input, model, output, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DrawerModule } from 'primeng/drawer';
import { NavItem } from '../../../core/models/utility.model';
import { User } from '../../../core/models/auth.model';

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
  public user = input<User | null>(null);
  public logout = output<void>();

  protected readonly menuGroups = signal<NavItem[]>([
    { label: 'Dashboard', icon: 'pi pi-home', route: '/dashboard', exact: true },
    { label: 'Orders', icon: 'pi pi-shopping-bag', route: '/dashboard/orders', badge: 0 },
    { label: 'Packages', icon: 'pi pi-box', route: '/dashboard/packages' },
    { label: 'Vouchers', icon: 'pi pi-ticket', route: '/dashboard/vouchers' },
    { label: 'AFA Registration', icon: 'pi pi-id-card', route: '/dashboard/afa' },
    { label: 'Wallet', icon: 'pi pi-wallet', route: '/dashboard/wallet' },
    { label: 'Transactions', icon: 'pi pi-money-bill', route: '/dashboard/transactions' },
    { label: 'My Shop', icon: 'pi pi-shop', route: '/dashboard/my-shop' },
    { label: 'Sub-agents', icon: 'pi pi-users', route: '/dashboard/sub-agents' },
    { label: 'Reports', icon: 'pi pi-chart-bar', route: '/dashboard/reports' },
  ]);

  protected closeSidebar(): void {
    this.visible.set(false);
  }

  protected triggerLogout(): void {
    this.closeSidebar();
    this.logout.emit();
  }
}

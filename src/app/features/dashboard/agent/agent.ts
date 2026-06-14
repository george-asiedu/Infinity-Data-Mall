import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { selectWallet } from '../../payment/store/payment.selectors';
import { selectUser } from '../../auth/store/auth.selectors';
import { StatCard } from '../../../core/models/utility.model';

@Component({
  selector: 'app-agent',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './agent.html',
  styleUrl: './agent.css',
})
export class Agent {
  private readonly store = inject(Store);

  protected readonly user = this.store.selectSignal(selectUser);
  private readonly wallet = this.store.selectSignal(selectWallet);

  protected readonly today = new Date();
  protected readonly balance = computed<number>(() => Number(this.wallet()?.balance ?? 0));

  protected readonly firstName = computed<string>(() => {
    const full = this.user()?.fullName?.trim();
    return full ? full.split(' ')[0] : 'there';
  });

  protected readonly agentCode = computed<string>(() => {
    const id = this.user()?.id ?? '';
    const tail = id
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(-4)
      .toUpperCase();
    return tail ? `AG-${tail}` : 'AG-0000';
  });

  protected readonly stats: StatCard[] = [
    {
      label: 'Total orders this month',
      value: '148',
      icon: 'pi-shopping-bag',
      iconClass: 'bg-primary/10 text-primary',
      trend: 12,
    },
    {
      label: 'Total sales this month',
      value: 'GHS 1,240',
      icon: 'pi-credit-card',
      iconClass: 'bg-accent/15 text-accent',
      trend: 18,
    },
    {
      label: 'Sub-agents',
      value: '6',
      icon: 'pi-users',
      iconClass: 'bg-info/10 text-info',
      trend: null,
      badge: '6 active',
    },
    {
      label: 'Shop profit this month',
      value: 'GHS 380',
      icon: 'pi-home',
      iconClass: 'bg-net-at/10 text-net-at',
      trend: -4,
    },
  ];
}

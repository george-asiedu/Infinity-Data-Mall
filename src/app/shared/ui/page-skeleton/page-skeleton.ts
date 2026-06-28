import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Skeleton } from '../skeleton/skeleton';

/**
 * Composable full-page loading skeleton built from the shared app-skeleton.
 * Screens toggle the sections they have (banner, stat cards, filter bar, table,
 * content blocks) so the placeholder roughly matches the real layout.
 */
@Component({
  selector: 'app-page-skeleton',
  standalone: true,
  imports: [CommonModule, Skeleton],
  templateUrl: './page-skeleton.html',
  styleUrl: './page-skeleton.css',
})
export class PageSkeleton {
  public banner = input<boolean>(false);
  public header = input<boolean>(true);
  public statCards = input<number>(0);
  public filterBar = input<boolean>(false);
  public tableRows = input<number>(0);
  public blocks = input<number>(0);

  protected range(n: number): number[] {
    return Array.from({ length: Math.max(0, n) }, (_, i) => i);
  }
}

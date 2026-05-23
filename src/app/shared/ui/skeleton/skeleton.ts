import { Component, input } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-skeleton',
  imports: [SkeletonModule],
  templateUrl: './skeleton.html',
  styleUrl: './skeleton.css',
})
export class Skeleton {
  public width = input<string>('100%');
  public height = input<string>('1rem');
  public shape = input<'rectangle' | 'circle'>('rectangle');
  public borderRadius = input<string>('');
  public customClass = input<string>('');
}

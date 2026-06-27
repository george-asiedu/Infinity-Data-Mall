import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css',
})
export class NotFoundPage {
  private readonly router = inject(Router);

  protected goHome(): void {
    this.router.navigateByUrl('/');
  }
  protected goBack(): void {
    history.length > 1 ? history.back() : this.goHome();
  }
}

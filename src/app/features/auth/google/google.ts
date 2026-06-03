import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { authActions } from '../store/auth.actions';
import { Toast } from '../../../core/services/toast/toast';

@Component({
  selector: 'app-google',
  imports: [CommonModule, ProgressSpinnerModule],
  templateUrl: './google.html',
  styleUrl: './google.css',
})
export class Google implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly toast = inject(Toast);

  ngOnInit(): void {
    const code = this.route.snapshot.queryParamMap.get('code');

    if (code) {
      this.store.dispatch(authActions.googleLogin({ code }));
    } else {
      this.toast.error('Authentication code missing from authentication provider.');
      this.router.navigate(['/login']);
    }
  }
}

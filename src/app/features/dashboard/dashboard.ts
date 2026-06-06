import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Toast } from '../../core/services/toast/toast';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private toast = inject(Toast);

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
}

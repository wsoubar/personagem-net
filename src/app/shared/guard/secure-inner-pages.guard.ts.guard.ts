import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class SecureInnerPagesGuard implements CanActivate {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  canActivate() {
    return this.auth.user$.pipe(take(1), map(user => user ? this.router.createUrlTree(['/dashboard']) : true));
  }
}

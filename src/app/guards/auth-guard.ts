import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../core/services/auth/auth';

export const authGuard = (requiredRoles: string[]): CanActivateFn => {
  return () => {
    const auth = inject(Auth);
    const router = inject(Router);

    if (!auth.currentUser()) {
      router.navigate(['/login']);
      return false;
    }

    if (auth.hasRole(requiredRoles)) {
      return true;
    }

    router.navigate(['/home']);
    return false;
  };
};

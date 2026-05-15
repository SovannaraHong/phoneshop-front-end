import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '../services/auth/auth';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { UserService } from '../services/user/user-service';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Auth);
  const token = auth.getToken();
  const router = inject(Router);
  const userService = inject(UserService);
  if (req.url.includes('/login')) {
    return next(req);
  }
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  // return next(req);
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        const errorMsg: string = err.error?.error ?? '';
        if (errorMsg.includes('expired')) {
          const userId = auth.getUserId();
          if (userId) {
            userService.suspendUser(userId).subscribe({
              next: () => {
                auth.logout();
                router.navigate(['/login'], { queryParams: { reason: 'expired' } });
              },
              error: () => {
                auth.logout();
                router.navigate(['/login'], { queryParams: { reason: 'expired' } });
              },
            });
          } else {
            auth.logout();
            router.navigate(['/login'], { queryParams: { reason: 'expired' } });
          }
        }
      }
      return throwError(() => err);
    }),
  );
};

import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { catchError, finalize, switchMap } from 'rxjs/operators';

import { Auth } from '../services/auth/auth';
import { UserService } from '../services/user/user-service';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Auth);
  const router = inject(Router);
  const userService = inject(UserService);

  // Skip auth header for login
  if (req.url.includes('/login')) {
    return next(req);
  }

  const token = auth.getToken();
  const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        const errorMsg: string = err.error?.error ?? '';

        if (errorMsg.includes('expired')) {
          const userId = auth.getUserId();
          const suspend$ = userId ? userService.suspendUser(userId) : of(null);

          return suspend$.pipe(
            finalize(() => {
              auth.logout();
              router.navigate(['/login'], { queryParams: { reason: 'expired' } });
            }),
            switchMap(() => throwError(() => err)),
          );
        }
      }

      return throwError(() => err);
    }),
  );
};

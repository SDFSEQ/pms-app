import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { catchError, throwError } from 'rxjs';

export const apiErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);

  return next(req).pipe(
    catchError(err => {
      const detail = err.error?.detail ?? err.message ?? 'An unexpected error occurred.';
      messageService.add({ severity: 'error', summary: 'Error', detail, life: 5000 });
      return throwError(() => err);
    })
  );
};

import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { catchError, map, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BackendInterceptorService implements HttpInterceptor {

  constructor(private router:Router, private messageService: MessageService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if(req.headers.has('skip-backend')){
      return next.handle(req);
    }

    let nextReq = req.clone({
      headers: req.headers.set('Authorization', 'Bearer '+ localStorage.getItem('token'))
    });


    // Add auth error handler
    return next.handle( nextReq ).pipe(
      catchError( (error:HttpErrorResponse, caught: any) => {
        if(error.status == 401){
          this.router.navigateByUrl('/auth/login');
        }else if(error.status != 422) {

          this.messageService.add({summary: 'Error', detail: 'Action failed! - ' + error.status , severity: 'error'});
        }
        return throwError('error');
      }),
      map((data:any) => {
        if(data.body && data.body.state && data.body.token){
          localStorage.setItem('token', data.body.token); 
        }
        return data;
      })
    );
  }

}

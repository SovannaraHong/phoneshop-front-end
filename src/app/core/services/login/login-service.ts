import { inject, Inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginResponse, LoginType } from '../../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private api = environment.baseUrl;
  private http = inject(HttpClient);
  // login(data: LoginType) {
  //   return this.http.post<LoginResponse>(`${this.api}/login`, data);
  // }
  login(data: LoginType): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.api}/login`, data);
  }
}

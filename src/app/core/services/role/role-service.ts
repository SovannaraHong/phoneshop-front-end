import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RoleType } from '../../models/user.model';
import { environment } from '../../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private api = environment.baseUrl;
  constructor(private http: HttpClient) {}

  getRoles(): Observable<RoleType[]> {
    return this.http.get<RoleType[]>(`${this.api}/role`);
  }
}

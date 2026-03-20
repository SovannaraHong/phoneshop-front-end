import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserType } from '../../models/user.model';
import { environment } from '../../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private api = environment.baseUrl;

  constructor(private http: HttpClient) {}

  getUser(): Observable<UserType[]> {
    return this.http.get<UserType[]>(`${this.api}/auth`);
  }

  createUser(userData: UserType): Observable<UserType> {
    return this.http.post<UserType>(`${this.api}/auth/register`, userData);
  }
  uploadImg(id: number, file: File) {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.put(`${this.api}/auth/${id}/image`, formData);
  }
}

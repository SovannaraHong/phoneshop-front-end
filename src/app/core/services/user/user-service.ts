import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PageDTO, UserType } from '../../models/user.model';
import { environment } from '../../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private api = environment.baseUrl;

  constructor(private http: HttpClient) {}

  // getUser(): Observable<UserType[]> {
  //   return this.http.get<UserType[]>(`${this.api}/auth`);
  // }
  getUser(
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'id',
    direction: 'asc' | 'desc' = 'asc',
  ): Observable<PageDTO<UserType>> {
    const params = new HttpParams()
      .set('_page', page.toString()) // ✅ underscore — matches your backend
      .set('_limit', limit.toString()) // ✅ underscore — matches your backend
      .set('sortBy', sortBy)
      .set('direction', direction);

    return this.http.get<PageDTO<UserType>>(`${this.api}/auth`, { params });
  }
  createUser(userData: UserType): Observable<UserType> {
    return this.http.post<UserType>(`${this.api}/auth/register`, userData);
  }
  uploadImg(id: number, file: File) {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.put(`${this.api}/auth/${id}/image`, formData);
  }
  deleteUser(id: number) {
    return this.http.delete(`${this.api}/auth/${id}`);
  }
  updateUser(id: number, user: UserType): Observable<UserType> {
    return this.http.put<UserType>(`${this.api}/auth/${id}`, user);
  }
  suspendUser(id: number): Observable<any> {
    return this.http.patch(`${this.api}/auth/${id}/status`, { status: 'Suspended' });
  }
}

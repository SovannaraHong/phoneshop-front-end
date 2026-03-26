import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { ColorType } from '../../models/color.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ColorService {
  private api = environment.baseUrl;
  constructor(private http: HttpClient) {}

  getColor(): Observable<ColorType[]> {
    return this.http.get<ColorType[]>(`${this.api}/colors`);
  }
}

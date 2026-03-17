import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { BrandType } from '../../models/brand.model';
import { environment } from '../../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class BrandService {
  private api = environment.baseUrl;
  constructor(private http: HttpClient) {}
  getBrands(): Observable<BrandType[]> {
    return this.http
      .get<{ list: BrandType[]; pagination: any }>(`${this.api}/brands`)
      .pipe(map((res) => res.list));
  }
}

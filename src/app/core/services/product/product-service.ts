import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ProductType } from '../../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private api = environment.baseUrl;
  constructor(private http: HttpClient) {}
  getProducts(): Observable<ProductType[]> {
    return this.http
      .get<{ list: ProductType[]; pagination: any }>(`${this.api}/products`)
      .pipe(map((res) => res.list));
  }
  createProduct(pro: ProductType): Observable<ProductType[]> {
    return this.http.post<ProductType[]>(`${this.api}/products`, pro);
  }
}

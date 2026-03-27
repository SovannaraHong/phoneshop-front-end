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

  getProductById(id: number): Observable<ProductType> {
    return this.http.get<ProductType>(`${this.api}/products/${id}`);
  }

  createProduct(pro: Partial<ProductType>): Observable<ProductType> {
    return this.http.post<ProductType>(`${this.api}/products`, pro);
  }

  updateProduct(id: number, pro: Partial<ProductType>): Observable<ProductType> {
    return this.http.put<ProductType>(`${this.api}/products/${id}`, pro);
  }

  deleteProduct(id: number): Observable<string> {
    return this.http.delete(`${this.api}/products/${id}`, { responseType: 'text' });
  }

  // Backend expects { "price": <BigDecimal> } — NOT "salePrice"
  // Returns plain text "Price updated successfully"
  createSell(id: number, price: number): Observable<string> {
    return this.http.post(
      `${this.api}/products/${id}/setPrice`,
      { price: price }, // ← was "salePrice", backend field is "price"
      { responseType: 'text' },
    );
  }

  // importProduct expects: { productId, importUnit, pricePerUnit, importDate }
  // Backend returns plain text "Import Product Sucesss" — use responseType: 'text'
  importProduct(payload: {
    productId: number;
    importUnit: number;
    pricePerUnit: number;
    importDate: string; // format: "YYYY-MM-DD HH:mm:ss"
  }): Observable<string> {
    return this.http.post(`${this.api}/products/importProduct`, payload, { responseType: 'text' });
  }

  importImage(id: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.put(`${this.api}/products/${id}/image`, formData);
  }
}

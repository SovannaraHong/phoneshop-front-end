import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ModelType } from '../../models/model.model';

@Injectable({
  providedIn: 'root',
})
export class ModelService {
  private api = environment.baseUrl;
  constructor(private http: HttpClient) {}

  getModel(): Observable<ModelType[]> {
    return this.http.get<ModelType[]>(`${this.api}/models`);
  }
}

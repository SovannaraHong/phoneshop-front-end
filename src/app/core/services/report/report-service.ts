import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';
import { ExpenseReport, ReportProduct } from '../../../pages/reports/reports';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private http = inject(HttpClient);
  private api = environment.baseUrl;

  getSalesReport(startDate: string, endDate: string): Observable<ReportProduct[]> {
    const start = `${startDate} 00:00:00`.replace(' ', '%20');
    const end = `${endDate} 23:59:59`.replace(' ', '%20');
    return this.http.get<ReportProduct[]>(`${this.api}/reports/${start}/${end}`);
  }

  getExpenseReport(startDate: string, endDate: string): Observable<ExpenseReport[]> {
    return this.http.get<ExpenseReport[]>(`${this.api}/reports/expense/${startDate}/${endDate}`);
  }

  getTotalSold(): Observable<ReportProduct[]> {
    return this.http.get<ReportProduct[]>(`${this.api}/reports`);
  }
}

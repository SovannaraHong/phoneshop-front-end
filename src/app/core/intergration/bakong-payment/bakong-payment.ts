import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
  selector: 'app-bakong-payment',
  imports: [CommonModule],
  templateUrl: './bakong-payment.html',
  styleUrl: './bakong-payment.css',
})
export class BakongPayment {
  qrCodeUrl: string | null = null;

  constructor(private http: HttpClient) {}

  generateQr() {
    const body = {
      amount: 1200,
      reference: 'TestPayment001',
    };

    this.http.post<any>('http://localhost:8080/api/bakong/generate-qr', body).subscribe({
      next: (res) => {
        // The response may contain a "qrImageUrl" or "qrCode" field
        // Adjust according to what the Bakong API returns
        this.qrCodeUrl = res.qrImageUrl || res.qrCode || null;
      },
      error: (err) => console.error(err),
    });
  }
}

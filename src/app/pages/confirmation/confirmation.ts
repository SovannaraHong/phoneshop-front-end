import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-confirmation',
  imports: [],
  templateUrl: './confirmation.html',
  styleUrl: './confirmation.css',
})
export class Confirmation {
  private router = inject(Router);

  goHome() {
    this.router.navigate(['/home']);
  }
  goProducts() {
    this.router.navigate(['/product']);
  }
}

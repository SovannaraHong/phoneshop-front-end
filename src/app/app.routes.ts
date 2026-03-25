import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'productList',
    loadComponent: () => import('./pages/product-list/product-list').then((m) => m.ProductList),
  },
  {
    path: 'product',
    loadComponent: () => import('./pages/product/product').then((m) => m.Product),
  },
  {
    path: 'user',
    loadComponent: () => import('./pages/user/user').then((m) => m.User),
  },
  {
    path: 'user/role',
    loadComponent: () => import('./pages/role/role').then((m) => m.Role),
  },
  {
    path: 'bakong',
    loadComponent: () =>
      import('./core/intergration/bakong-payment/bakong-payment').then((m) => m.BakongPayment),
  },
  // ✅ redirect unknown paths to home
  { path: '**', redirectTo: 'home', pathMatch: 'full' },
];

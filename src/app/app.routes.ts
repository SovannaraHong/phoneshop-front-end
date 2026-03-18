import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },

  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
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
        path: 'bakong',
        loadComponent: () =>
          import('./core/intergration/bakong-payment/bakong-payment').then((m) => m.BakongPayment),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];

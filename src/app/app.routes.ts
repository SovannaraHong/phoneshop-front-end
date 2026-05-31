import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
    canActivate: [authGuard(['Admin', 'Manager', 'Stock', 'Cashier', 'Seller', 'Staff'])],
  },
  {
    path: 'productList',
    loadComponent: () => import('./pages/product-list/product-list').then((m) => m.ProductList),
    canActivate: [authGuard(['Admin', 'Manager', 'Stock', 'Cashier', 'Seller', 'Staff'])],
  },
  {
    path: 'product',
    loadComponent: () => import('./pages/product/product').then((m) => m.Product),
    children: [
      {
        path: 'lowStock',
        loadComponent: () =>
          import('./pages/inventory/low-stock/low-stock').then((m) => m.LowStock),
        canActivate: [authGuard(['Admin', 'Manager', 'Stock', 'Sale'])],
      },
      {
        path: 'outOfStock',
        loadComponent: () =>
          import('./pages/inventory/out-of-stock/out-of-stock').then((m) => m.OutOfStock),
        canActivate: [authGuard(['Admin', 'Manager', 'Stock', 'Sale'])],
      },
    ],
    canActivate: [authGuard(['Admin', 'Manager', 'Stock', 'Sale'])],
  },
  {
    path: 'user',
    loadComponent: () => import('./pages/user/user').then((m) => m.User),
    canActivate: [authGuard(['Admin', 'Manager'])],
  },
  {
    path: 'user/role',
    loadComponent: () => import('./pages/role/role').then((m) => m.Role),
    canActivate: [authGuard(['Admin', 'Manager'])],
  },
  {
    path: 'productform',
    loadComponent: () => import('./content/product-form/product-form').then((m) => m.ProductForm),
    canActivate: [authGuard(['Admin', 'Manager', 'Stock'])],
  },
  {
    path: 'bakong',
    loadComponent: () =>
      import('./core/intergration/bakong-payment/bakong-payment').then((m) => m.BakongPayment),
    canActivate: [authGuard(['Admin', 'Manager', 'Cashier', 'Seller'])],
  },
  {
    path: 'report',
    loadComponent: () => import('./pages/reports/reports').then((m) => m.Reports),
    canActivate: [authGuard(['Admin', 'Manager', 'Stock', 'Staff', 'Seller'])],
  },
  {
    path: 'history-import',
    loadComponent: () =>
      import('./pages/product-history-import/product-history-import').then(
        (m) => m.ProductHistoryImport,
      ),
    canActivate: [authGuard(['Admin', 'Manager', 'Stock'])],
  },
  {
    path: 'checkout',
    loadComponent: () => import('./pages/checkout/checkout').then((m) => m.Checkout),
    canActivate: [authGuard(['Admin', 'Manager', 'Stock', 'Cashier', 'Seller'])],
  },
  {
    path: 'confirmation',
    loadComponent: () => import('./pages/confirmation/confirmation').then((m) => m.Confirmation),
    canActivate: [authGuard(['Admin', 'Manager', 'Cashier', 'Seller', 'Staff'])],
  },
  { path: '**', redirectTo: 'home', pathMatch: 'full' },
];

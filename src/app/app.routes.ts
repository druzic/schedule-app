import { Routes, CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Home } from './home/home';

// Firebase Auth + observable authState
import { Auth, authState } from '@angular/fire/auth';
import { map, take } from 'rxjs/operators';

const authGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  const auth = inject(Auth);

  return authState(auth).pipe(
    take(1),
    map((user) => {
      if (user) return true;
      router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    })
  );
};

export const routes: Routes = [
  {
    component: Home,
    path: '',
  },
  { path: 'login', loadComponent: () => import('./login/login').then((m) => m.Login) },

  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./dashboard/dashboard').then((m) => m.Dashboard),
  },
];

import { Routes, CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Home } from './home/home';

// Firebase Auth + observable authState
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { map, take } from 'rxjs/operators';

const authGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  const auth = getAuth();

  // Vratimo Promise koji se riješi kad dobijemo prvi auth state
  return new Promise<boolean>((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      if (user) {
        resolve(true);
      } else {
        router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        resolve(false);
      }
    });
  });
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

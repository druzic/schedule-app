import { Injectable, inject } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { signOut } from 'firebase/auth';
import { map, shareReplay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);

  /** Firebase user stream (null ako nije logiran) */
  user$ = authState(this.auth).pipe(shareReplay({ bufferSize: 1, refCount: true }));

  /** Je li logiran */
  isLoggedIn$ = this.user$.pipe(map((u) => !!u));

  /** Odjava */
  logout() {
    return signOut(this.auth);
  }
}

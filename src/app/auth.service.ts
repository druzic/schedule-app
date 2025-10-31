import { Injectable, inject } from '@angular/core';
import { getAuth, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { map, shareReplay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = getAuth();

  currentUser: User | null = null;
  /** Firebase user stream (null ako nije logiran) */
  constructor() {
    // sluša promjene korisnika
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser = user;
    });
  }

  /** provjera je li korisnik prijavljen */
  get isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  /** odjava */
  logout() {
    return signOut(this.auth);
  }
}

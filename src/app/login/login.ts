// src/app/login/login.component.ts
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

import {
  getAuth,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from 'firebase/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  email = '';
  password = '';
  remember = true; // default: zapamti
  errorMessage: string | null = null;
  loading = false;

  private returnUrl = '/dashboard';
  private auth = getAuth();

  constructor(private router: Router, private route: ActivatedRoute) {
    const q = this.route.snapshot.queryParams['returnUrl'];
    if (q) {
      this.returnUrl = q;
    }
  }

  async login() {
    this.errorMessage = null;
    this.loading = true;
    try {
      // Postavi persistence prema checkboxu prije sign-in-a
      await setPersistence(
        this.auth,
        this.remember ? browserLocalPersistence : browserSessionPersistence
      );

      await signInWithEmailAndPassword(this.auth, this.email, this.password);

      await this.router.navigateByUrl(this.returnUrl);
    } catch (error: any) {
      console.error('Greška pri prijavi:', error);
      this.errorMessage = error?.message ?? 'Došlo je do pogreške. Provjerite podatke.';
    } finally {
      this.loading = false;
    }
  }
}

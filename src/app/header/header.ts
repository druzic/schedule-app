import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { getAuth, signOut } from 'firebase/auth';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  auth = inject(AuthService);
  private router = inject(Router);
  private firebaseAuth = getAuth();

  async logout(event?: Event) {
    event?.preventDefault(); // spriječi navigaciju s <a href>
    await signOut(this.firebaseAuth); // odjava
    this.router.navigateByUrl('/login'); // redirect na login
  }
}

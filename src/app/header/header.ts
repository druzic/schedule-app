import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { Auth, signOut } from '@angular/fire/auth';

@Component({
  selector: 'app-header',
  imports: [RouterLink, AsyncPipe],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  auth = inject(AuthService);
  private router = inject(Router);
  private Auth = inject(Auth);

  async logout(event?: Event) {
    event?.preventDefault(); // spriječi navigaciju s <a href>
    await signOut(this.Auth); // odjava
    this.router.navigateByUrl('/login'); // redirect na login
  }
}

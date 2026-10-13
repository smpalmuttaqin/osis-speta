import { Injectable, signal } from '@angular/core';

export type UserRole = 'admin' | 'user' | null;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  readonly currentUser = signal<UserRole>(this.getInitialRole());
  readonly currentUsername = signal<string>(this.getInitialUsername());

  private getInitialRole(): UserRole {
    return null;
  }

  private getInitialUsername(): string {
    return '';
  }

  login(code: string): boolean {
    const trimmed = code.trim();
    if (trimmed === 'admin354') {
      this.currentUser.set('admin');
      this.currentUsername.set('admin354');
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('evoting_role', 'admin');
        localStorage.setItem('evoting_username', 'admin354');
      }
      return true;
    } else if (trimmed === 'speta123') {
      this.currentUser.set('user');
      this.currentUsername.set('speta123');
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('evoting_role', 'user');
        localStorage.setItem('evoting_username', 'speta123');
      }
      return true;
    }
    return false;
  }

  logout(): void {
    this.currentUser.set(null);
    this.currentUsername.set('');
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('evoting_role');
      localStorage.removeItem('evoting_username');
    }
  }
}

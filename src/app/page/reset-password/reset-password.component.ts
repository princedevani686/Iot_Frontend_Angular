import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  imports: [FormsModule, CommonModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
})
export class ResetPasswordComponent {
  newPassword: string = ''; 
  message: string = ''; 
  error: boolean = false; 
  uidb64: string; 
  token: string; 
  loading: boolean = false;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.uidb64 = this.route.snapshot.paramMap.get('uidb64') || '';
    this.token = this.route.snapshot.paramMap.get('token') || '';
  }

  resetPassword(): void {
    console.log('Password:', this.newPassword);

    if (!this.newPassword || this.newPassword.length < 6) {
      this.message = 'Password must be at least 6 characters long.';
      this.error = true;
      return;
    }

    this.loading = true;

    this.authService.resetPassword(this.uidb64, this.token, this.newPassword).subscribe({
      next: () => {
        this.message = 'Password reset successful! Redirecting to login...';
        this.error = false;
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (err) => {
        console.error(err); 
        this.message = 'Password reset failed. Please try again.';
        this.error = true;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}

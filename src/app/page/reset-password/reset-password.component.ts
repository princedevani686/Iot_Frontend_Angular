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
  newPassword: string = ''; // Holds the new password entered by the user
  message: string = ''; // Message to show success or error
  error: boolean = false; // Flag to indicate whether the operation failed
  uidb64: string; // Holds the user ID in base64 format
  token: string; // Holds the password reset token
  loading: boolean = false; // Flag to indicate if the request is in progress

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Retrieve `uidb64` and `token` from the URL
    this.uidb64 = this.route.snapshot.paramMap.get('uidb64') || '';
    this.token = this.route.snapshot.paramMap.get('token') || '';
  }

  resetPassword(): void {
    console.log('Password:', this.newPassword);

    // Validate the password length (minimum 6 characters)
    if (!this.newPassword || this.newPassword.length < 6) {
      this.message = 'Password must be at least 6 characters long.';
      this.error = true;
      return;
    }

    // Set loading flag to true when the request starts
    this.loading = true;

    // Call the resetPassword method from the AuthService
    this.authService.resetPassword(this.uidb64, this.token, this.newPassword).subscribe({
      next: () => {
        // On success, show success message and redirect to the login page after 3 seconds
        this.message = 'Password reset successful! Redirecting to login...';
        this.error = false;
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (err) => {
        // On failure, display the error message
        console.error(err); // Log the error for debugging purposes
        this.message = 'Password reset failed. Please try again.';
        this.error = true;
      },
      complete: () => {
        // Set loading flag to false once the request is completed
        this.loading = false;
      }
    });
  }
}

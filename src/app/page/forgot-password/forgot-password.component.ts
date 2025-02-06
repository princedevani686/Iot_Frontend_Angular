import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms'; // Correct import
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar'; // Optional
import { HttpClient } from '@angular/common/http'; // Optional

@Component({
  selector: 'app-forgot-password',
  imports: [FormsModule, CommonModule, RouterModule], // Correct imports here
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
})
export class  ForgotPasswordComponent {
  email: string = '';
  message: string = '';
  error: boolean = false;
  loading: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  requestPasswordReset() {
    if (!this.email) {
      this.message = 'Please enter your email.';
      this.error = true;
      return;
    }

    this.loading = true;
    this.authService.forgotPassword(this.email).subscribe(
      (response) => {
        this.message = response.message;
        this.error = false;
        this.loading = false;
      },
      (error) => {
        this.message = error.error?.error || 'Error sending reset email.';
        this.error = true;
        this.loading = false;
      }
    );
  }
}
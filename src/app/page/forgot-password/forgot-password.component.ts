import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';


@Component({
  selector: 'app-forgot-password',
  imports: [FormsModule, CommonModule, RouterModule],
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
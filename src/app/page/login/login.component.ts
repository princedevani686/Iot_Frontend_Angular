import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  activeForm: 'login' | 'register' | 'forgot-password' = 'login'; 
  registerObj: RegisterModel = new RegisterModel();
  loginObj: LoginModel = new LoginModel();

  constructor(
    private _snackbar: MatSnackBar,
    private _router: Router,
    private _http: HttpClient
  ) {}

  toggleForm(form: 'login' | 'register' | 'forgot-password') {
    this.activeForm = form;
    if (form === 'forgot-password') {
      this._router.navigate(['/forgot-password']);
    }
  }

  // Register form 
  registerForm() {
    this._http.post('http://localhost:8000/register/', this.registerObj).subscribe(
      () => {
        this._snackbar.open('Registration successful!', 'Close', { duration: 3000 });
        this.toggleForm('login'); 
      },
      (error) => {
        this._snackbar.open('Registration failed.', 'Close', { duration: 3000 });
        console.error('Registration error:', error);
      }
    );
  }

  // Login form 
  loginForm() {
    if (!this.loginObj.email || !this.loginObj.password) {
      this._snackbar.open('Please enter email and password.', 'Close', { duration: 3000 });
      return;
    }

    this._http.post('http://localhost:8000/login/', this.loginObj).subscribe(
      (response: any) => {
        if (response.access_token) {
          localStorage.setItem('access_token', response.access_token);
          localStorage.setItem('refresh_token', response.refresh_token);
          localStorage.setItem('user', JSON.stringify(response.user));
          this._snackbar.open('Login successful!', 'Close', { duration: 3000 });
          this._router.navigate(['/dashboard']); 
        } else {
          this._snackbar.open('Unexpected error during login.', 'Close', { duration: 3000 });
        }
      },
      (error) => {
        this._snackbar.open('Invalid email or password.', 'Close', { duration: 3000 });
        console.error('Login error:', error);
      }
    );
  }
}

// Register model
export class RegisterModel {
  username: string = '';
  email: string = '';
  password: string = '';
  password2: string = ''; 
}

// Login model
export class LoginModel {
  email: string = '';
  password: string = '';
}


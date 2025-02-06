import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable ,throwError  } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8000/api'; // Backend API URL
  private userSubject = new BehaviorSubject<any>(this.getUserFromStorage());

  constructor(private http: HttpClient, private router: Router) {}

  // Get Auth Headers with Token
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders(token ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } : {});
  }
 

  // Register a New User
  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register/`, user).pipe(
      catchError((error) => {
        console.error('Registration failed', error);
        throw error; // Or handle more gracefully
      })
    );
  }

  // Log in a User
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/token/`, credentials).pipe(
      map((response: any) => {
        this.saveUserToStorage(response); // Save user data to local storage
        return response;
      }),
      catchError((error) => {
        console.error('Login failed', error);
        throw error; // Handle error appropriately
      })
    );
  }

  // Save User to Local Storage
  private saveUserToStorage(user: any): void {
    localStorage.setItem('loggedUser', JSON.stringify(user.user));
    localStorage.setItem('token', user.token);
    this.userSubject.next(user.user); // Update the logged-in user
  }

  // Get User from Local Storage
  private getUserFromStorage(): any {
    const userData = localStorage.getItem('loggedUser');
    return userData ? JSON.parse(userData) : null;
  }

  // Get the Current Logged-in User
  getUser(): Observable<any> {
    return this.userSubject.asObservable();
  }

  // Log Out the User
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('loggedUser');
    this.userSubject.next(null); // Clear user data
    this.router.navigate(['/login']); // Redirect to Login Page
  }

  // Check if User is Authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  // Add a New Register to a Device
  addRegister(deviceId: number, register: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/device-metadata/`, {
      ...register,
      device: deviceId,
    }, { headers: this.getAuthHeaders() }).pipe(
      catchError((error) => {
        console.error('Error adding register', error);
        throw error;
      })
    );
  }


  
  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/forgot-password/`, { email });
  }



  
  resetPassword(uidb64: string, token: string, newPassword: string) {
    const url = `http://localhost:8000/api/reset-password/${uidb64}/${token}/`;  // Correct URL to backend
  
    const body = { password: newPassword };  // Body data for the POST request
  
    return this.http.post(url, body);  // Sending the request to the backend server
  }
  

  // Fetch Device Details by ID
  getDeviceDetails(deviceId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/devices/${deviceId}/`, { headers: this.getAuthHeaders() }).pipe(
      catchError((error) => {
        console.error('Error fetching device details', error);
        throw error;
      })
    );
  }

  // Update Device Details
  updateDevice(deviceId: number, deviceData: any): Observable<any> {
    const url = `${this.apiUrl}/devices/${deviceId}/`;
  
    return this.http.put(url, deviceData, { headers: this.getAuthHeaders() }).pipe(
      map((response: any) => {
        console.log('Device updated successfully:', response);
        return response;
      }),
      catchError((error) => {
        console.error('Error updating device details:', error);
        alert('Failed to update device. Please try again.');
        throw error; // Handle error properly
      })
    );
  }

  deleteDevice(deviceId: number): Observable<void> {
    const url = `${this.apiUrl}/devices/${deviceId}/`;
    const headers = this.getAuthHeaders(); // Ensure headers are included
    
    return this.http.delete<void>(url, { headers }).pipe(
      catchError((error) => {
        console.error('Error deleting device:', error);
        alert('Failed to delete device. Please check your authentication.');
        return throwError(() => error);
      })
    );
  }
  

  // Get Dashboard Data (Requires Authorization)
  getDashboardData(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/`, { headers: this.getAuthHeaders() }).pipe(
      catchError((error) => {
        console.error('Error fetching dashboard data', error);
        throw error;
      })
    );
  }

  // Simulate Device Data (Send to Backend)
  simulateDeviceData(newData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/device-data/`, newData, { headers: this.getAuthHeaders() }).pipe(
      catchError((error) => {
        console.error('Error simulating device data', error);
        throw error;
      })
    );
  }
  
  // Optionally handle Token Refresh (if backend supports refresh tokens)
  refreshAccessToken(refreshToken: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/refresh-token/`, { refresh_token: refreshToken }).pipe(
      map((response: any) => {
        localStorage.setItem('token', response.token); // Store the new access token
        return response;
      }),
      catchError((error) => {
        console.error('Error refreshing token', error);
        throw error;
      })
    );
  }
}

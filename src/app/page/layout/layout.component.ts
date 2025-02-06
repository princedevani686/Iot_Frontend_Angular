import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
// import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FormsModule ,CommonModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent {
  isSidebarActive: boolean = false;
  loggedUser: any = null;  // Default value for loggedUser
  accessToken: string | null = null;  // Default value for accessToken
  username: string | null = '';
  

  constructor(private _router: Router ) {
    // Retrieve loggedUser and accessToken from localStorage
    const localUser = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');
    // const username = localStorage.getItem('username');
    // console.log('Username from loggedUser:', username);  // Debug log to confirm
    console.log(localUser);

    
    if (localUser && localUser !== 'undefined') {
      try {
        this.loggedUser = JSON.parse(localUser);  // Safely parse the loggedUser
        this.username = this.loggedUser.username || '';  // Extract username from the object
      } catch (error) {
        console.error('Error parsing loggedUser from localStorage:', error);
        this.loggedUser = null;  // Reset if error occurs
        this.username = '';  // Reset username if there's an error
      }
    }
    
    if (token) {
      this.accessToken = token;  // Store the accessToken
    }
  }


  // Method to log out
  onLogout() {
    localStorage.removeItem('access_token');  // Remove access token from localStorage
    localStorage.removeItem('refresh_token');  // Remove access token from localStorage
    localStorage.removeItem('user');  // Remove logged user data from localStorage
    this.loggedUser = null;  // Reset loggedUser in component
    this._router.navigateByUrl('/login');  // Redirect to login page
  }

  // Method to toggle the sidebar
  toggleSidebar() {
    this.isSidebarActive = !this.isSidebarActive;
  }
}

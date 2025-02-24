import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FormsModule ,CommonModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent {
  isSidebarActive: boolean = false;
  loggedUser: any = null;  
  accessToken: string | null = null;
  username: string | null = '';
  

  constructor(private _router: Router ) {
    const localUser = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');
    console.log(localUser);

    
    if (localUser && localUser !== 'undefined') {
      try {
        this.loggedUser = JSON.parse(localUser);  
        this.username = this.loggedUser.username || ''; 
      } catch (error) {
        console.error('Error parsing loggedUser from localStorage:', error);
        this.loggedUser = null; 
        this.username = '';  
      }
    }
    
    if (token) {
      this.accessToken = token;  
    }
  }


  // Method to log out
  onLogout() {
    localStorage.removeItem('access_token');  
    localStorage.removeItem('refresh_token');  
    localStorage.removeItem('user');  
    this.loggedUser = null;  
    this._router.navigateByUrl('/login'); 
  }

  // Method to toggle the sidebar
  toggleSidebar() {
    this.isSidebarActive = !this.isSidebarActive;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const sidebar = document.getElementById('sidebar');
    const toggleButton = document.getElementById('toggleSidebar');
 
    if (sidebar && toggleButton && !sidebar.contains(event.target as Node) && !toggleButton.contains(event.target as Node)) {
      this.isSidebarActive = false;
    }
  }
}

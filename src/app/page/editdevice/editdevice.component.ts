import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-editdevice',
  imports: [CommonModule, FormsModule],
  templateUrl: './editdevice.component.html',
  styleUrls: ['./editdevice.component.css']
})
export class EditDeviceComponent implements OnInit {
  device: any = {};
  deviceId: number;
  apiUrl = 'http://127.0.0.1:8000/devices';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {
    this.deviceId = +this.route.snapshot.paramMap.get('id')!;
  }

  ngOnInit(): void {
    this.getDeviceDetails();
  }

  // Fetch device 
  getDeviceDetails(): void {
    const token = localStorage.getItem('access_token'); 
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get(`${this.apiUrl}/${this.deviceId}/`, { headers }).subscribe({
      next: (data) => {
        this.device = data;
      },
      error: (err) => {
        console.error('Error fetching device details:', err);
        alert('Failed to load device details.');
      }
    });
  }

  // update device 
  onUpdateDevice(): void {
    if (!this.device.name || !this.device.type) {
      alert('Please fill in all fields.');
      return;
    }

    const token = localStorage.getItem('access_token'); 
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.patch(`${this.apiUrl}/${this.deviceId}/`, this.device, { headers }).subscribe({
      next: () => {
        alert('Device updated successfully!');
        this.router.navigate(['/device']); 
      },
      error: (err) => {
        console.error('Error updating device:', err);
        alert('Failed to update device.');
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/device']);
  }
}

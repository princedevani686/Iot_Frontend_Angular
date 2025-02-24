import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-device',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './device.component.html',
  styleUrls: ['./device.component.css'],
})
export class DeviceComponent implements OnInit {
  devices: any[] = [];
  newDevice: any = {
    name: '',
    type: '',
    status: 'inactive',
  };

  constructor(private http: HttpClient, private router: Router, private deviceService: AuthService) { }

  ngOnInit(): void {
    this.getDevices();
  }

  // Fetch all devices
  getDevices() {
    const token = localStorage.getItem('access_token');

    if (!token) {
      alert('User not authenticated. Please log in.');
      return;
    }

    this.http.get(
      'http://127.0.0.1:8000/devices/',
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    ).subscribe(
      (data: any) => {
        this.devices = data;
      },
      (error) => {
        console.error('Error fetching devices:', error);
        alert('Failed to fetch devices: ' + (error.error?.detail || 'Unknown error'));
      }
    );
  }

  // Add a new device
  addDevice() {
    const token = localStorage.getItem('access_token');

    if (!token) {
      alert('User not authenticated. Please log in.');
      return;
    }

    this.http.post(
      'http://127.0.0.1:8000/devices/',
      this.newDevice,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    ).subscribe(
      (data: any) => {
        this.devices.push(data);
        this.newDevice = { name: '', type: '', status: 'inactive' };
      },
      (error) => {
        console.error('Error adding device:', error);
        alert('Failed to add device: ' + (error.error?.detail || 'Unknown error'));
      }
    );
  }


  loadingStates: { [key: number]: boolean } = {};
  intervals: { [key: number]: any } = {};

  toggleDeviceStatus(device: any) {
    this.loadingStates[device.id] = true;
    const updatedStatus = device.status === 'active' ? 'inactive' : 'active';

    this.http.patch(`http://127.0.0.1:8000/devices/${device.id}/status/`, {
      status: updatedStatus,
    }).subscribe({
      next: () => {
        device.status = updatedStatus;
        this.loadingStates[device.id] = false;

        if (updatedStatus === 'active') {
          this.startDataSimulation(device.id, device.type.toLowerCase());
        } else {
          this.stopDataSimulation(device.id); 
        }
      },
      error: (error) => {
        this.loadingStates[device.id] = false;
        console.error('Error:', error);
        alert(`Failed to update status: ${error.error?.error || 'Unknown error'}`);
      }
    });
  }

  startDataSimulation(deviceId: number, dataType: string) {
    this.stopDataSimulation(deviceId); 

    this.intervals[deviceId] = setInterval(() => {
      this.http.post(`http://127.0.0.1:8000/device_data/`, {
        device_id: deviceId,
        type: dataType,
      }).subscribe({
        next: () => {
          console.log(`Simulated ${dataType} data for device ${deviceId}`);
        },
        error: (err) => {
          console.error('Simulation error:', err);
          alert(`Simulation failed: ${err.error?.error || 'Check device status'}`);
        }
      });
    }, 60000);  
  }
  stopDataSimulation(deviceId: number) {
    if (this.intervals[deviceId]) {
      clearInterval(this.intervals[deviceId]);
      delete this.intervals[deviceId];
      console.log(`Stopped data simulation for device ${deviceId}`);
    }
  }



  // Delete a device
  deleteDevice(deviceId: number): void {
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('User not authenticated. Please log in.');
      return;
    }

    this.http.delete(
      `http://127.0.0.1:8000/devices/${deviceId}/`,
      { headers: { Authorization: `Bearer ${token}` } }
    ).subscribe(
      () => {
        this.devices = this.devices.filter((device) => device.id !== deviceId);
        alert('Device deleted successfully.');
      },
      (error) => {
        console.error('Error deleting device:', error);
        alert('An error occurred while deleting the device.');
      }
    );
  }
}
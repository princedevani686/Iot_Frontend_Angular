import { Component, OnInit } from '@angular/core';
import * as FileSaver from 'file-saver';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

@Component({
  selector: 'app-report',
  imports: [FormsModule, CommonModule],
  standalone: true,
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {
  devices: any[] = [];
  filteredData: any[] = [];
  selectedDevice: string = '';
  selectedRange: string = 'daily';
  dataFetched: boolean = false;
  isReportGenerated = false; // Initially false
  apiUrl = 'http://127.0.0.1:8000/api/devices/';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchDevices();
  }

  // Function to get auth headers
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token'); // Retrieve JWT token
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // Fetch all devices with authentication
  fetchDevices() {
    this.http.get(this.apiUrl, { headers: this.getAuthHeaders() }).subscribe(
      (data: any) => {
        this.devices = data.devices;
      },
      (error) => {
        console.error('Error fetching devices:', error);
        alert('Failed to fetch device data. Please log in again.');
      }
    );
  }

  // Generate report based on selected device and range
  generateReport() {
    if (!this.selectedDevice) {
      alert('Please select a device.');
      return;
    }

    const params = new HttpParams()
      .set('device_id', this.selectedDevice)
      .set('range', this.selectedRange);

    this.http.get(`${this.apiUrl}filter/`, { headers: this.getAuthHeaders(), params }).subscribe(
      (data: any) => {
        this.filteredData = data.filtered_devices;
        this.dataFetched = true;
        this.isReportGenerated = this.filteredData.length > 0; // Show download buttons only if data is present

      },
      (error) => {
        console.error('Error filtering devices:', error);
        alert('Failed to fetch data. Please try again later.');
        this.dataFetched = true; // Show "no data" message
      }
    );
  }


  // Download CSV file
  // Download CSV file with Sr. No.
downloadCSV() {
  if (this.filteredData.length === 0) {
    alert('No data available to download.');
    return;
  }

  // Add 'Sr. No.' as the first column
  const headers = ['Sr. No.', 'Device ID', 'Type', 'Value', 'Timestamp'];
  const rows = this.filteredData.map((device, index) => [
    index + 1,  // Sr. No.
    device.device_id,
    device.type,
    device.value,
    new Date(device.timestamp).toLocaleString()
  ]);

  const csvContent = [
    headers.join(','), // Headers
    ...rows.map(row => row.map(value => `"${value?.toString().replace(/"/g, '""')}"`).join(',')) // Data
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  FileSaver.saveAs(blob, 'device_report.csv');
}


  // Download PDF file with Sr. No.
downloadPDF() {
  if (this.filteredData.length === 0) {
    alert('No data available to download.');
    return;
  }

  const doc = new jsPDF();
  const headers = ['Sr. No.', 'Device ID', 'Type', 'Value', 'Timestamp'];
  const tableRows = this.filteredData.map((device, index) => [
    index + 1,  // Sr. No.
    device.device_id,
    device.type,
    device.value,
    new Date(device.timestamp).toLocaleString()
  ]);

  doc.setFontSize(16);
  doc.text('Device Report', 14, 20);

  (doc as any).autoTable({
    head: [headers],
    body: tableRows,
    startY: 30,
    margin: { horizontal: 10 },
    theme: 'grid',
    styles: { fontSize: 10 }
  });

  doc.save('device_report.pdf');
}
}
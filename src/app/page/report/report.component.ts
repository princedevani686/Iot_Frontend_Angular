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
  displayedData: any[] = []; 
  selectedDevice: string = '';
  selectedRange: string = '';
  dataFetched: boolean = false;
  isReportGenerated = false;
  apiUrl = 'http://127.0.0.1:8000/api/devices/';

  currentPage: number = 1; 
  itemsPerPage: number = 15;  
  totalPages: number = 0; 

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchDevices();
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

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

  generateReport() {
    if (!this.selectedDevice && !this.selectedRange) {
      alert('Please select a device type and a range.');
      return;
    }

    if (!this.selectedDevice) {
      alert('Please select a device type.');
      return;
    }

    if (!this.selectedRange) {
      alert('Please select a range.');
      return;
    }
    const params = new HttpParams()
      .set('device_id', this.selectedDevice)
      .set('range', this.selectedRange);

    this.http.get(`${this.apiUrl}filter/`, { headers: this.getAuthHeaders(), params }).subscribe(
      (data: any) => {
        this.filteredData = data.filtered_devices;
        this.dataFetched = true;
        this.isReportGenerated = this.filteredData.length > 0;
        this.setupPagination();
      },
      (error) => {
        console.error('Error filtering devices:', error);
        alert('Failed to fetch data. Please try again later.');
        this.dataFetched = true;
      }
    );
  }

  setupPagination() {
    this.currentPage = 1;
    this.totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
    this.updateDisplayedData();
  }

  updateDisplayedData() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.displayedData = this.filteredData.slice(start, end);
  }

  goToPage(page: number) {
    if (page > 0 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedData();
    }
  }



  // Download CSV file
downloadCSV() {
  if (this.filteredData.length === 0) {
    alert('No data available to download.');
    return;
  }

  const headers = ['Sr. No.',  'Type', 'Value', 'Timestamp'];
  const rows = this.filteredData.map((device, index) => [
    index + 1,  
    device.type,
    device.value,
    new Date(device.timestamp).toLocaleString()
  ]);

  const csvContent = [
    headers.join(','), 
    ...rows.map(row => row.map(value => `"${value?.toString().replace(/"/g, '""')}"`).join(',')) 
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  FileSaver.saveAs(blob, 'device_report.csv');
}


  // Download PDF file 
downloadPDF() {
  if (this.filteredData.length === 0) {
    alert('No data available to download.');
    return;
  }

  const doc = new jsPDF();
  const headers = ['Sr. No.', 'Type', 'Value', 'Timestamp'];
  const tableRows = this.filteredData.map((device, index) => [
    index + 1, 
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
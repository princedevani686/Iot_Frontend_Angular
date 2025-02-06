import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import annotationPlugin, { AnnotationOptions } from 'chartjs-plugin-annotation';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  devices: any[] = [];
  selectedDevice: string = '';
  selectedRange: string = 'daily';
  deviceData: any[] = [];
  deviceInfo: any = null;
  lineChart: Chart | null = null;
  apiUrl = 'http://127.0.0.1:8000/api/devices/';
  pollingInterval: any = null;

  constructor(private http: HttpClient) {
    Chart.register(...registerables, annotationPlugin);
  }

  ngOnInit(): void {
    this.fetchDevices();
    setTimeout(() => this.initChart(), 500); // Ensure the chart is initialized after the DOM is ready
  }

  ngOnDestroy(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  fetchDevices() {
    this.http.get(this.apiUrl, { headers: this.getAuthHeaders() }).subscribe(
      (response: any) => {
        this.devices = response.devices;
      },
      (error) => {
        console.error('Error fetching devices:', error);
        alert('Failed to fetch devices. Please log in again.');
      }
    );
  }

  generateReport() {
    if (!this.selectedDevice) {
      alert('Please select a device.');
      return;
    }

    const params = new HttpParams()
      .set('device_id', this.selectedDevice)
      .set('range', this.selectedRange);

    this.http.get(`${this.apiUrl}chart-data/`, { headers: this.getAuthHeaders(), params }).subscribe(
      (response: any) => {
        if (response.device_data?.length > 0) {
          this.deviceData = response.device_data;
          this.deviceInfo = response.device_info;
          this.updateChart();
          this.startLiveUpdates();
        } else {
          alert('No data available for the selected device and time range.');
          this.deviceData = [];
          this.deviceInfo = null;
          this.updateChart();
        }
      },
      (error) => {
        console.error('Error fetching device data:', error);
        alert('Failed to fetch data. Please log in again.');
        this.deviceData = [];
        this.deviceInfo = null;
        this.updateChart();
      }
    );
  }

  initChart() {
    const ctx = document.getElementById('lineChart') as HTMLCanvasElement;
    if (!ctx) {
      console.error("Chart canvas not found.");
      return;
    }

    this.lineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Initializing...'],
        datasets: [
          {
            label: 'Device Data',
            data: [0],
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderWidth: 2,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          annotation: { annotations: [] },
        },
        scales: {
          x: { title: { display: true, text: 'Timestamp' } },
          y: { title: { display: true, text: 'Value' } },
        },
      },
    });
  }

  updateChart() {
    if (!this.lineChart) return;

    const recentData = this.deviceData.slice(-6);
    const timestamps = recentData.map((data) => data.timestamp);
    const values = recentData.map((data) => data.value);

    const annotations: AnnotationOptions<'line'>[] = [];

    const startFlowIndex = recentData.findIndex((data) => data.event === 'start_flow');
    if (startFlowIndex !== -1) {
      annotations.push({
        type: 'line',
        scaleID: 'x',
        value: timestamps[startFlowIndex],
        borderColor: 'red',
        borderWidth: 2,
        label: { content: 'Start Flow', display: true, position: 'start' },
      });
    }

    const stopFlowIndex = recentData.findIndex((data) => data.event === 'stop_flow');
    if (stopFlowIndex !== -1) {
      annotations.push({
        type: 'line',
        scaleID: 'x',
        value: timestamps[stopFlowIndex],
        borderColor: 'blue',
        borderWidth: 2,
        label: { content: 'Stop Flow', display: true, position: 'start' },
      });
    }

    this.lineChart.data.labels = timestamps;
    this.lineChart.data.datasets[0].data = values;
    (this.lineChart.options.plugins?.annotation as any).annotations = annotations;
    this.lineChart.update();
  }

  startLiveUpdates() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }

    this.pollingInterval = setInterval(() => {
      const params = new HttpParams()
        .set('device_id', this.selectedDevice)
        .set('range', this.selectedRange);

      this.http.get(`${this.apiUrl}chart-data/`, { headers: this.getAuthHeaders(), params }).subscribe(
        (response: any) => {
          if (response.device_data?.length > 0) {
            this.deviceData = response.device_data;
            this.updateChart();
          }
        },
        (error) => {
          console.error('Error fetching live data:', error);
        }
      );
    }, 5000); // Refresh every 5 seconds
  }
}

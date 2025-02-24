import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import annotationPlugin from 'chartjs-plugin-annotation';

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
  selectedRange: string = '';
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
    setTimeout(() => this.initChart(), 500);
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

    this.http.get(`${this.apiUrl}chart-data/`, { headers: this.getAuthHeaders(), params }).subscribe(
      (response: any) => {
        if (response.device_data?.length > 0) {
          this.deviceData = response.device_data;
          this.deviceInfo = response.device_info;

          this.updateChartBasedOnRange();
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
        labels: [],
        datasets: [
          {
            label: 'Device Data',
            data: [],
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

  updateChartBasedOnRange() {
    if (!this.lineChart) return;

    this.deviceData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    if (this.selectedRange === 'daily') {
      this.updateChart();
    } else if (this.selectedRange === 'weekly') {
      this.updateChartForWeekly();
    } else if (this.selectedRange === 'monthly') {
      this.updateChartForMonthly();
    }
  }

  updateChart() {
    if (!this.lineChart) return;

    const timestamps = this.deviceData.map((data) => {
      return new Date(data.timestamp).toLocaleString(); 
    });

    const values = this.deviceData.map((data) => data.value);

    this.lineChart.data.labels = timestamps; 
    this.lineChart.data.datasets[0].data = values;
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
            const newDeviceData = response.device_data;

            this.deviceData = [...newDeviceData, ...this.deviceData].slice(0, 6); 
            this.updateChart();
          }
        },
        (error) => {
          console.error('Error fetching live data:', error);
        }
      );
    }, 600000); 
  }

  updateChartForWeekly() {
    if (!this.lineChart) return;

    const dayOfWeekData = this.deviceData.reduce((acc: any, data) => {
      const date = new Date(data.timestamp);
      const dayOfWeek = date.toLocaleString('default', { weekday: 'long' });

      if (!acc[dayOfWeek]) {
        acc[dayOfWeek] = { total: 0, count: 0 };
      }
      acc[dayOfWeek].total += data.value;
      acc[dayOfWeek].count += 1;
      return acc;
    }, {});

    const orderedDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const labels = orderedDays.filter(day => dayOfWeekData[day]);
    const averageValues = labels.map(day => dayOfWeekData[day].total / dayOfWeekData[day].count);

    this.lineChart.data.labels = labels; 
    this.lineChart.data.datasets[0].data = averageValues;
    this.lineChart.update();
  }

  updateChartForMonthly() {
    if (!this.lineChart) return;

    const monthlyData = this.deviceData.reduce((acc: any, data) => {
      const date = new Date(data.timestamp);
      const month = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!acc[month]) {
        acc[month] = { total: 0, count: 0 };
      }
      acc[month].total += data.value;
      acc[month].count += 1;
      return acc;
    }, {});

    const months = Object.keys(monthlyData).sort((a, b) => {
      return new Date(a).getTime() - new Date(b).getTime();
    });
    const averageValues = months.map((month) => monthlyData[month].total / monthlyData[month].count);

    this.lineChart.data.labels = months;
    this.lineChart.data.datasets[0].data = averageValues;
    this.lineChart.update();
  }
}

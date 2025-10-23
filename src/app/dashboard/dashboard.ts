import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  imports: [FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  standalone: true,
})
export class Dashboard {
  name = '';
  services = [
    { id: 1, serviceName: 'Šminkanje', price: 45 },
    { id: 2, serviceName: 'Pedikura', price: 35 },
    { id: 3, serviceName: 'Lakiranje', price: 15 },
  ];
}

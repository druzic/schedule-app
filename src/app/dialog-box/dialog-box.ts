import { Component, Inject, LOCALE_ID } from '@angular/core';
import { Appointment } from '../dashboard/dashboard';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-dialog-box',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatTimepickerModule,
    FormsModule,
    MatSelectModule,
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'hr-HR' },
    { provide: MAT_DATE_LOCALE, useValue: 'hr-HR' },
    provideNativeDateAdapter(),
  ],
  templateUrl: './dialog-box.html',
  styleUrl: './dialog-box.css',
})
export class DialogBox {
  timeSlots: string[] = [
    '08:00',
    '08:45',
    '09:30',
    '10:15',
    '11:00',
    '11:45',
    '12:30',
    '13:15',
    '14:00',
    '14:45',
    '15:30',
    '16:15',
    '17:00',
    '17:45',
    '18:30',
    '19:15',
  ];
  editedAppointment: Appointment;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.editedAppointment = JSON.parse(JSON.stringify(data));
    console.log('Dialog opened with data:', this.editedAppointment.time);
  }
  onClose(): void {
    console.log('Dialog closed');
  }
  onSave(): void {
    console.log(this.data);
    console.log('Edit appointment');
  }
  onDelete(): void {
    console.log('Delete appointment');
  }
}

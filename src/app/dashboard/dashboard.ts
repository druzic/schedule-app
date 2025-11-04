import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule, registerLocaleData } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { LOCALE_ID } from '@angular/core';
import localeHr from '@angular/common/locales/hr';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { DialogBox } from '../dialog-box/dialog-box';

// ✅ čisti Firebase SDK (bez AngularFire Firestore)
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  where,
} from 'firebase/firestore';

registerLocaleData(localeHr, 'hr-HR');

type Client = {
  id?: string;
  name: string;
  phone?: string | null;
  ig?: string | null;
  createdAt?: any;
};
type Service = { id: number; serviceName: string; price: number };

export type Appointment = {
  id?: string;
  clientId: string;
  clientName: string; // Denormalizirano ime
  serviceId: number;
  serviceName: string | null;
  date: Date; // Ovo se u bazi sprema kao Timestamp
  time: string;
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDatepickerModule,
    MatCardModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatFormFieldModule,
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'hr-HR' },
    { provide: MAT_DATE_LOCALE, useValue: 'hr-HR' },
    provideNativeDateAdapter(),
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  db = getFirestore(); // ✅ koristi default app iz provideFirebaseApp()

  name = '';
  phone = '';
  ig = '';
  showExtra = false;

  workStart = 8;
  workEnd = 20;
  stepMin = 45;
  time = '';

  saving = false;

  readonly dialog = inject(MatDialog);

  openDialog(appointment: Appointment) {
    console.log('Opening dialog' + appointment);
    const dialogRef = this.dialog.open(DialogBox, {
      data: appointment,
    });
  }

  handleSlotClick(slot: {
    label: string;
    date: Date;
    isBooked: boolean;
    appointment?: Appointment;
  }) {
    if (slot.isBooked && slot.appointment) {
      this.openDialog(slot.appointment);
    } else {
      this.time = slot.label;
    }
  }

  services: Service[] = [
    { id: 1, serviceName: 'Šminkanje', price: 45 },
    { id: 2, serviceName: 'Pedikura', price: 35 },
    { id: 3, serviceName: 'Lakiranje', price: 15 },
  ];
  selectedServiceId: number | null = null;
  selected: Date = this.todayLocal();

  nameControl = new FormControl<string>('');
  clients: Client[] = [];
  appointments: Appointment[] = [];
  filteredClients$!: Observable<Client[]>;
  selectedClient: Client | null = null;

  async ngOnInit() {
    await this.loadAllClients();
    await this.loadAppointments(this.selected);
    this.filteredClients$ = this.nameControl.valueChanges.pipe(
      startWith(this.nameControl.value ?? ''),
      map((v) => this.filterClients(v))
    );
  }

  displayClientName(c: any): string {
    return c?.name || c || '';
  }

  onClientSelected(c: Client) {
    this.selectedClient = c;
    this.name = c.name;
    this.phone = c.phone || '';
    this.ig = c.ig || '';
  }

  toggleExtra() {
    this.showExtra = !this.showExtra;
  }

  onDateChanged(d: Date) {
    this.selected = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    this.loadAppointments(this.selected);
  }

  private todayLocal() {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  shiftDay(n: number) {
    const d = new Date(this.selected);
    d.setDate(d.getDate() + n);
    this.onDateChanged(d);
    this.time = '';
  }

  goToday() {
    this.onDateChanged(this.todayLocal());
    this.time = '';
  }

  onNameInputChange(event: Event) {
    const inputValue = (event.target as HTMLInputElement).value;
    this.name = inputValue;

    if (this.selectedClient && this.selectedClient.name !== inputValue) {
      this.selectedClient = null;
    }
    console.log('Input name changed to:', inputValue);
  }

  get slots(): { label: string; date: Date; isBooked: boolean; appointment?: Appointment }[] {
    const out: { label: string; date: Date; isBooked: boolean; appointment?: Appointment }[] = [];

    // Stvorite mapu zauzetih vremena radi brze provjere
    const bookedTimes = new Map<string, Appointment>();
    this.appointments.forEach((app) => {
      bookedTimes.set(app.time, app); // Vrijeme (string) kao ključ
    });

    let h = this.workStart,
      m = 0;

    while (true) {
      const label = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      const appointment = bookedTimes.get(label);

      const date = new Date(
        this.selected.getFullYear(),
        this.selected.getMonth(),
        this.selected.getDate(),
        h,
        m,
        0,
        0
      );

      out.push({
        label,
        date,
        isBooked: !!appointment, // true ako postoji termin
        appointment, // Dodajte cijeli objekt termina ako postoji
      });

      // Logika za sljedeći slot (ostaje ista)
      const next = new Date(date.getTime() + this.stepMin * 60000);
      if (
        next.getHours() > this.workEnd ||
        (next.getHours() === this.workEnd && next.getMinutes() > 0)
      )
        break;
      h = next.getHours();
      m = next.getMinutes();
    }
    return out;
  }
  get selectedService() {
    return this.services.find((s) => s.id === this.selectedServiceId);
  }

  private async loadAllClients() {
    const querySnapshot = await getDocs(collection(this.db, 'clients'));
    querySnapshot.forEach((doc) => {
      this.clients.push({ id: doc.id, ...(doc.data() as Client) });
      console.log(doc.id, ' => ', doc.data());
    });
  }

  async saveAppointment() {
    const trimmedName = this.name.trim();
    if (!trimmedName || !this.selectedServiceId || !this.time) {
      alert('Odaberi klijenticu, uslugu i vrijeme!');
      return;
    }
    this.saving = true;

    try {
      let clientName = trimmedName;
      let clientId = '';
      if (this.selectedClient && this.selectedClient.id) {
        clientId = this.selectedClient.id;
      } else {
        const hasPhone = this.phone.trim();
        const hasIg = this.ig.trim();
        if (!(hasPhone || hasIg)) {
          alert('Unesite barem jedan kontakt (telefon ili Instagram)!');
          this.saving = false;
          return;
        }
        const newClient = {
          name: clientName,
          phone: this.phone.trim() || null,
          ig: this.ig.trim() || null,
          createdAt: serverTimestamp(),
        };
        const docRef = await addDoc(collection(this.db, 'clients'), newClient);
        clientId = docRef.id;
        console.log('New client added with ID:', clientId);

        this.clients.push({ id: clientId, ...newClient });
      }

      const data = {
        clientId: clientId,
        clientName: trimmedName,
        serviceId: this.selectedServiceId,
        serviceName:
          this.services.find((s) => s.id === this.selectedServiceId)?.serviceName || null,
        date: this.selected,
        time: this.time,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(this.db, 'appointments'), data);

      console.log('Appointment saved with ID:', docRef.id);

      const newAppointment: Appointment = {
        id: docRef.id, // Koristimo novi ID iz Firebasea
        ...data,
      };

      this.appointments.push(newAppointment);
      this.time = '';
      this.saving = false;
    } catch (error) {
      console.error('Greška kod spremanja termina:', error);
    }
  }

  private async loadAppointments(date: Date) {
    this.appointments = [];

    try {
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
      const appointmentsRef = collection(this.db, 'appointments');

      // Kreiramo upit za sve termine gdje je 'date' između početka i kraja dana
      const q = query(
        appointmentsRef,
        where('date', '>=', startOfDay),
        where('date', '<=', endOfDay)
      );

      const querySnapshot = await getDocs(q);

      this.appointments = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // ✅ Konvertirajte Firebase Timestamp natrag u JS Date objekt
          date: (data['date'] as any).toDate(),
        } as Appointment;
      });

      console.log(`Loaded ${this.appointments.length} appointments for the day.`);
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  }

  private filterClients(term: any): Client[] {
    const value = (typeof term === 'string' ? term : term?.name || '').toLowerCase().trim();
    if (!value) return this.clients.slice(0, 50);
    return this.clients.filter((c) => (c.name || '').toLowerCase().startsWith(value)).slice(0, 50);
  }
}

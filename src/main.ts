// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app'; // tvoja root komponenta
import { appConfig } from './app/app.config'; // ako ga imaš

// ✅ Firebase vanilla init
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, setPersistence, indexedDBLocalPersistence } from 'firebase/auth';
import { environment } from './environments/environment';

// Inicijaliziraj DEFAULT app jednom
if (!getApps().length) {
  initializeApp(environment.firebase);
}

// (opcionalno) Auth persistence preko IndexedDB
const auth = getAuth();
void setPersistence(auth, indexedDBLocalPersistence);

// Bootstrap Angular app-a
bootstrapApplication(App, appConfig).catch((err) => console.error(err));

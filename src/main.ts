// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
// Nema više Firebase inicijalizacije ovdje!
// Importiranjem 'firebase-config.ts' osiguravaš da se kod u toj datoteci izvrši
// i inicijalizira Firebase PRIJE nego što se Angular aplikacija bootstrappa.

bootstrapApplication(App, appConfig).catch((err) => console.error(err));

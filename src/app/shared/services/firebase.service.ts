import { Injectable } from '@angular/core';
import { FirebaseOptions, initializeApp } from 'firebase/app';
import { Auth, connectAuthEmulator, getAuth } from 'firebase/auth';
import { Firestore, connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { environment } from '../../../config/environment';

declare global {
  interface Window { personagensFirebaseConfig?: FirebaseOptions; }
}

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  readonly auth: Auth | null;
  private readonly firestore: Firestore | null;

  constructor() {
    const config = environment.useEmulators ? {
      apiKey: 'demo-api-key', authDomain: 'demo-personagens.firebaseapp.com',
      projectId: 'demo-personagens', appId: 'demo-app-id'
    } : window.personagensFirebaseConfig;
    if (!config?.apiKey || !config.projectId || !config.authDomain || !config.appId) {
      this.auth = null;
      this.firestore = null;
      return;
    }
    const app = initializeApp(config);
    this.auth = getAuth(app);
    this.firestore = getFirestore(app);
    if (environment.useEmulators) {
      connectAuthEmulator(this.auth, 'http://127.0.0.1:9099', { disableWarnings: true });
      connectFirestoreEmulator(this.firestore, '127.0.0.1', 8080);
    }
  }

  get db(): Firestore {
    if (!this.firestore) { throw new Error('Firebase não configurado. Consulte o README.'); }
    return this.firestore;
  }
}

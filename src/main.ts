import { enableProdMode } from '@angular/core';
import { platformBrowser } from '@angular/platform-browser';
import { AppModule } from './app/app.module';
import { environment } from './config/environment';

async function bootstrap(): Promise<void> {
  if (environment.production) {
    enableProdMode();
    try {
      const response = await fetch('assets/firebase-config.local.json', { cache: 'no-store' });
      if (response.ok) { window.personagensFirebaseConfig = await response.json(); }
    } catch {
      // Sem configuração, a aplicação inicia bloqueando operações com Firebase.
    }
  }
  await platformBrowser().bootstrapModule(AppModule);
}

bootstrap().catch(error => console.error('Não foi possível iniciar a aplicação.', error));

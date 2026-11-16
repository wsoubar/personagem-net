import { AppModule } from '../../app.module';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { AuthService } from '../../shared/services/auth.service';
import { SignUpComponent } from './sign-up.component';

describe('SignUpComponent', () => {
  it('exibe a ação de autenticação sem acessar serviços remotos', async () => {
    await TestBed.configureTestingModule({
      imports: [AppModule], providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { userData: { email: 'teste@example.com' }, busy: () => false,
          SignUp: vi.fn(), SendVerificationMail: vi.fn() } }
      ]
    }).compileComponents();
    const fixture = TestBed.createComponent(SignUpComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Criar conta');
  });
});

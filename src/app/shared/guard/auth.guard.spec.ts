import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Subject, firstValueFrom } from 'rxjs';
import { User } from 'firebase/auth';
import { AuthService } from '../services/auth.service';
import { AuthGuard } from './auth.guard';
import { SecureInnerPagesGuard } from './secure-inner-pages.guard.ts.guard';

describe('Guards de sessão', () => {
  let state: Subject<User | null>;
  beforeEach(() => {
    state = new Subject();
    TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: AuthService, useValue: { user$: state } }] });
  });

  it('aguarda o Firebase e rejeita sessão mesmo com localStorage forjado', async () => {
    localStorage.setItem('user', '{"uid":"forjado"}');
    const guard = TestBed.runInInjectionContext(() => new AuthGuard());
    let resolved = false;
    const result = firstValueFrom(guard.canActivate()).then(value => { resolved = true; return value; });
    await Promise.resolve();
    expect(resolved).toBe(false);
    state.next(null);
    expect(TestBed.inject(Router).serializeUrl(await result as ReturnType<Router['createUrlTree']>)).toBe('/sign-in');
    localStorage.removeItem('user');
  });

  it('permite usuário autenticado sem exigir verificação de e-mail', async () => {
    const guard = TestBed.runInInjectionContext(() => new AuthGuard());
    const result = firstValueFrom(guard.canActivate());
    state.next({ uid: 'owner', emailVerified: false } as User);
    expect(await result).toBe(true);
  });

  it('redireciona usuário autenticado nas telas públicas', async () => {
    const guard = TestBed.runInInjectionContext(() => new SecureInnerPagesGuard());
    const result = firstValueFrom(guard.canActivate());
    state.next({ uid: 'owner' } as User);
    expect(TestBed.inject(Router).serializeUrl(await result as ReturnType<Router['createUrlTree']>)).toBe('/dashboard');
  });
});

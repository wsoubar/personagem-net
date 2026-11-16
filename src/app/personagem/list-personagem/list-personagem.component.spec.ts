import { AppModule } from '../../app.module';
import { TestBed } from '@angular/core/testing';
import { ReplaySubject, Subject } from 'rxjs';
import { User } from 'firebase/auth';
import { vi } from 'vitest';
import { AuthService } from '../../shared/services/auth.service';
import { PersonagemService } from '../../shared/services/personagem.service';
import { Personagem } from '../../shared/model/personagem.model';
import { ListPersonagemComponent } from './list-personagem.component';

describe('Listagem de personagens', () => {
  it('aguarda a sessão, trata falha e limpa dados no logout', () => {
    const user$ = new ReplaySubject<User | null>(1);
    const records = new Subject<Personagem[]>();
    const listAllByUserId = vi.fn(() => records);
    TestBed.configureTestingModule({ imports: [AppModule], providers: [
      { provide: AuthService, useValue: { user$ } },
      { provide: PersonagemService, useValue: { listAllByUserId } }
    ] });
    const component = TestBed.runInInjectionContext(() => new ListPersonagemComponent());
    expect(listAllByUserId).not.toHaveBeenCalled();
    user$.next({ uid: 'owner' } as User);
    expect(listAllByUserId).toHaveBeenCalledWith('owner');
    records.next([{ id: 'personagem', nome: 'Helena' } as Personagem]);
    expect(component.personagens()).toHaveLength(1);
    expect(component.creationDate(null)).toBeNull();
    expect(component.creationDate(new Date('invalid'))).toBeNull();
    records.error(new Error('permission-denied'));
    expect(component.error()).toContain('Não foi possível');
    expect(component.personagens()).toHaveLength(0);
    user$.next(null);
    expect(component.personagens()).toHaveLength(0);
    expect(component.error()).toBe('');
  });
});

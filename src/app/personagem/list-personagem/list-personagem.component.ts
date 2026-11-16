import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap } from 'rxjs';
import { PersonagemService } from '../../shared/services/personagem.service';
import { AuthService } from '../../shared/services/auth.service';
import { Personagem } from '../../shared/model/personagem.model';

@Component({
  standalone: false,
  selector: 'app-list-personagem',
  templateUrl: './list-personagem.component.html',
  styleUrls: ['./list-personagem.component.scss']
})
export class ListPersonagemComponent {
  private readonly service = inject(PersonagemService);
  private readonly auth = inject(AuthService);
  readonly personagens = signal<Personagem[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  constructor() {
    this.auth.user$.pipe(
      switchMap(user => {
        this.personagens.set([]);
        this.error.set('');
        this.loading.set(!!user);
        return user ? this.service.listAllByUserId(user.uid).pipe(catchError(() => {
          this.error.set('Não foi possível carregar seus personagens. Tente novamente mais tarde.');
          return of([]);
        })) : of([]);
      }),
      takeUntilDestroyed(inject(DestroyRef))
    ).subscribe(personagens => {
      this.personagens.set(personagens);
      this.loading.set(false);
    });
  }

  creationDate(value: Personagem['dataCriacao']): Date | null {
    if (!value) { return null; }
    const date = value instanceof Date ? value : typeof value.toDate === 'function' ? value.toDate() : null;
    return date && Number.isFinite(date.getTime()) ? date : null;
  }
}

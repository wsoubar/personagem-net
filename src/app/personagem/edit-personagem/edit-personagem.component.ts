import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';
import { PersonagemService } from '../../shared/services/personagem.service';
import { Personagem } from '../../shared/model/personagem.model';

@Component({
  standalone: false,
  selector: 'app-edit-personagem',
  templateUrl: './edit-personagem.component.html',
  styleUrls: ['./edit-personagem.component.scss']
})
export class EditPersonagemComponent {
  readonly personagem = signal<Personagem | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');

  constructor() {
    const service = inject(PersonagemService);
    inject(ActivatedRoute).paramMap.pipe(
      switchMap(params => {
        this.loading.set(true);
        this.error.set('');
        this.personagem.set(null);
        const id = params.get('id');
        return id ? service.getByID(id).pipe(catchError(() => {
          this.error.set('Não foi possível carregar este personagem.');
          return of(null);
        })) : of(null);
      }),
      takeUntilDestroyed(inject(DestroyRef))
    ).subscribe(value => {
      this.personagem.set(value);
      this.loading.set(false);
    });
  }
}

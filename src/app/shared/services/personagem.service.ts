import { Injectable, inject } from '@angular/core';
import {
  addDoc, collection, deleteDoc, doc, onSnapshot, query, updateDoc, where
} from 'firebase/firestore';
import { Observable } from 'rxjs';
import { Personagem } from '../model/personagem.model';
import { FirebaseService } from './firebase.service';

@Injectable({ providedIn: 'root' })
export class PersonagemService {
  private readonly firebase = inject(FirebaseService);
  readonly personagemRef = 'personagem';

  listAllByUserId(userID: string): Observable<Personagem[]> {
    return new Observable(subscriber => {
      const ref = query(collection(this.firebase.db, this.personagemRef), where('userID', '==', userID));
      return onSnapshot(ref, snapshot => subscriber.next(snapshot.docs.map(item => ({
        ...item.data(), id: item.id
      } as Personagem))), error => subscriber.error(error));
    });
  }

  getByID(id: string): Observable<Personagem | null> {
    return new Observable(subscriber => onSnapshot(doc(this.firebase.db, this.personagemRef, id), snapshot => {
      subscriber.next(snapshot.exists() ? { ...snapshot.data(), id: snapshot.id } as Personagem : null);
    }, error => subscriber.error(error)));
  }

  create(personagem: Personagem) {
    const { id: _id, ...data } = personagem;
    return addDoc(collection(this.firebase.db, this.personagemRef), data);
  }

  update(personagem: Personagem) {
    const { id, ...data } = personagem;
    return updateDoc(doc(this.firebase.db, this.personagemRef, id), data);
  }

  delete(id: string) {
    return deleteDoc(doc(this.firebase.db, this.personagemRef, id));
  }
}

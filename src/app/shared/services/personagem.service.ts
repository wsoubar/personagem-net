import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Personagem } from '../model/personagem.model';

@Injectable({
    providedIn: 'root'
})
export class PersonagemService {

    personagemRef = 'personagem';

    constructor(private firestore: AngularFirestore) { }

    /*
     * busca todos os personagens 
     */
    listAll () {
        return this.firestore.collection(this.personagemRef).snapshotChanges();
    }

    /*
     * busca todos os personagens de um usuário
     */
    listAllByUserId(userID: string) {
        return this.firestore.collection(this.personagemRef, ref => ref.where('userID', '==', userID)).snapshotChanges();
    }

    getByID(id: string) {
        return this.firestore.doc<Personagem>(this.personagemRef + '/' + id).valueChanges();
    }


    /*
     * inclui um personagem  
     */
    create(personagem: Personagem) {
        return this.firestore.collection(this.personagemRef).add(personagem);
    }

    /*
     * atualizar um personagem  
     */
    update(personagem: Personagem) {
        return this.firestore.doc(this.personagemRef + '/' + personagem.id).update(personagem);
    }

    /*
     * remover um personagem  
     */
    delete(id: string) {
        return this.firestore.doc(this.personagemRef + '/' + id).delete();
    } 
}

import { Component, OnInit } from '@angular/core';
import { PersonagemService } from 'src/app/shared/services/personagem.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { Personagem } from 'src/app/shared/model/personagem.model';

@Component({
  selector: 'app-list-personagem',
  templateUrl: './list-personagem.component.html',
  styleUrls: ['./list-personagem.component.scss']
})
export class ListPersonagemComponent implements OnInit {

  constructor(private perService: PersonagemService, private authService: AuthService) { }

  personagens: Personagem[];

  ngOnInit() {
    this.listPersonagens();
  }

  delete(id: string) {
    console.log('delete ', id);
    this.perService.delete(id);
  }

  listPersonagens() {
    console.log('listPersonagens');
    this.perService.listByUserId(this.authService.userData.uid).subscribe(
      //data => (this.personagens = data)
      data => {
        console.log('data', data);
        this.personagens = data.map (e=>{
          return {
            id: e.payload.doc.id,
            ...e.payload.doc.data()
          } as Personagem
        });
      }
    );
  }

}

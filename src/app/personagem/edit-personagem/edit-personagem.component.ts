import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { PersonagemService } from 'src/app/shared/services/personagem.service';
import { switchMap } from 'rxjs/operators';
import { Personagem } from 'src/app/shared/model/personagem.model';
import { database } from 'firebase';

@Component({
  selector: 'app-edit-personagem',
  templateUrl: './edit-personagem.component.html',
  styleUrls: ['./edit-personagem.component.scss']
})
export class EditPersonagemComponent implements OnInit {

  id: string;
  personagem: Personagem;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private service: PersonagemService) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.id = params.get("id");
      this.service.getByID(this.id).subscribe(
        data => {
          console.log('data personagem', data);

        }
      );
    });
  }

}

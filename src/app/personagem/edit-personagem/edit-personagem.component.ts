import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { PersonagemService } from 'src/app/shared/services/personagem.service';
import { Personagem } from 'src/app/shared/model/personagem.model';
import { ToastrService } from 'ngx-toastr';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-edit-personagem',
  templateUrl: './edit-personagem.component.html',
  styleUrls: ['./edit-personagem.component.scss']
})
export class EditPersonagemComponent implements OnInit {

  personagem = new Personagem();

  constructor(private activatedRoute: ActivatedRoute,
    private service: PersonagemService,
    private toastr: ToastrService
    ) { }

  ngOnInit() {
    const routeParams = this.activatedRoute.snapshot.params;
    const id = routeParams.id;
    //this.toastr.info("Toastr teste : " + id);
    this.service.getByID(id).subscribe(
      data => {
        console.log('data personagem', data);
        //data.id = id;
        this.personagem = data;
      }
    );

  }

}

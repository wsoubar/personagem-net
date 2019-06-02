import { Component } from '@angular/core';
import { AuthService } from './shared/services/auth.service';
import * as $ from 'jquery';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  title = 'personagens';
  //isLogged : boolean = false;

  constructor(private authService: AuthService) {
  }

}

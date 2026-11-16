import { Component, inject, signal } from '@angular/core';
import { AuthService } from './shared/services/auth.service';
import { NoticeService } from './shared/services/notice.service';

@Component({
  standalone: false,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  readonly authService = inject(AuthService);
  readonly notice = inject(NoticeService);
  readonly menuOpen = signal(false);
}

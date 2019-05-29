import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// Required components for which route services to be activated
import { SignInComponent } from 'src/app/components/sign-in/sign-in.component';
import { SignUpComponent } from 'src/app/components/sign-up/sign-up.component';
import { DashboardComponent } from 'src/app/components/dashboard/dashboard.component';
import { ForgotPasswordComponent } from 'src/app/components/forgot-password/forgot-password.component';
import { VerifyEmailComponent } from 'src/app/components/verify-email/verify-email.component';
import { ListPersonagemComponent } from 'src/app/personagem/list-personagem/list-personagem.component';
import { EditPersonagemComponent } from 'src/app/personagem/edit-personagem/edit-personagem.component';
import { AddPersonagemComponent } from 'src/app/personagem/add-personagem/add-personagem.component';
import { FeedComponent } from 'src/app/components/feed/feed.component';
// Import canActivate guard services
import { AuthGuard } from "src/app/shared/guard/auth.guard";
import { SecureInnerPagesGuard } from "src/app/shared/guard/secure-inner-pages.guard.ts.guard";
// Include route guard in routes array
const routes: Routes = [
  { path: '', redirectTo: '/sign-in', pathMatch: 'full' },
  { path: 'sign-in', component: SignInComponent, canActivate: [SecureInnerPagesGuard] },
  { path: 'register-user', component: SignUpComponent, canActivate: [SecureInnerPagesGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'forgot-password', component: ForgotPasswordComponent, canActivate: [SecureInnerPagesGuard] },
  { path: 'verify-email-address', component: VerifyEmailComponent, canActivate: [SecureInnerPagesGuard] },
  { path: 'list-personagem', component: ListPersonagemComponent, canActivate: [AuthGuard] },
  { path: 'edit-personagem', component: EditPersonagemComponent, canActivate: [AuthGuard]}, 
  { path: 'add-personagem', component: AddPersonagemComponent, canActivate: [AuthGuard]}, 
  { path: 'feed', component: FeedComponent, canActivate: [AuthGuard]}, 
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
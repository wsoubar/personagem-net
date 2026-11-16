import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  AuthProvider, FacebookAuthProvider, GoogleAuthProvider, User,
  createUserWithEmailAndPassword, onAuthStateChanged, sendEmailVerification,
  sendPasswordResetEmail, signInAnonymously, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile
} from 'firebase/auth';
import { Timestamp, doc, setDoc, writeBatch } from 'firebase/firestore';
import { environment } from '../../../config/environment';
import { ReplaySubject } from 'rxjs';
import { FirebaseService } from './firebase.service';
import { NoticeService } from './notice.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly firebase = inject(FirebaseService);
  private readonly router = inject(Router);
  private readonly notice = inject(NoticeService);
  private readonly state = new ReplaySubject<User | null>(1);
  private readonly currentUser = signal<User | null>(null);
  readonly user$ = this.state.asObservable();
  readonly busy = signal(false);
  readonly demoEnabled = !environment.production && environment.useEmulators;

  constructor() {
    const auth = this.firebase.auth;
    if (!auth) {
      this.state.next(null);
      this.notice.show('Firebase não configurado. Consulte o README para configurar esta instalação.');
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, user => {
      this.currentUser.set(user);
      this.state.next(user);
    }, () => {
      this.currentUser.set(null);
      this.state.next(null);
      this.notice.show('Não foi possível recuperar a sessão. Entre novamente.');
    });
    inject(DestroyRef).onDestroy(unsubscribe);
  }

  get userData(): User | null { return this.currentUser(); }
  get isLoggedIn(): boolean { return this.userData !== null; }

  SignInDemo(): Promise<void> {
    return this.perform(async () => {
      const auth = this.requireAuth();
      if (!this.demoEnabled || !auth.emulatorConfig || auth.app.options.projectId !== 'demo-personagens') {
        throw new Error('O acesso de demonstração está disponível somente nos emuladores locais.');
      }
      const { user } = await signInAnonymously(auth);
      await updateProfile(user, { displayName: 'Visitante de demonstração' });
      await this.SetUserData(user);
      const batch = writeBatch(this.firebase.db);
      const examples = [
        { name: 'Explorador (exemplo)', summary: 'Personagem fictício para conhecer a listagem e a tela de detalhes.' },
        { name: 'Cronista (exemplo)', summary: 'Outro personagem de demonstração, criado apenas no ambiente local.' }
      ];
      examples.forEach((example, index) => {
        batch.set(doc(this.firebase.db, 'personagem', `demo-${user.uid}-${index}`), {
          nome: example.name, resumo: example.summary, userID: user.uid, dataCriacao: Timestamp.now()
        });
      });
      await batch.commit();
      await this.router.navigate(['/dashboard']);
      this.notice.show('Demonstração local: personagens de exemplo. Inclusão, edição, exclusão e feed ainda estão incompletos.');
    });
  }

  SignIn(email: string, password: string): Promise<void> {
    return this.perform(async () => {
      const result = await signInWithEmailAndPassword(this.requireAuth(), email, password);
      await this.saveProfile(result.user);
      await this.router.navigate(['/dashboard']);
    });
  }

  SignUp(email: string, password: string): Promise<void> {
    return this.perform(async () => {
      const result = await createUserWithEmailAndPassword(this.requireAuth(), email, password);
      await this.saveProfile(result.user);
      await sendEmailVerification(result.user);
      await this.router.navigate(['/verify-email-address']);
      this.notice.show('Conta criada. Confira o e-mail de verificação.');
    });
  }

  SendVerificationMail(): Promise<void> {
    return this.perform(async () => {
      const user = this.requireAuth().currentUser;
      if (!user) { throw new Error('Entre na sua conta para verificar o e-mail.'); }
      await sendEmailVerification(user);
      this.notice.show('E-mail de verificação enviado.');
    });
  }

  ForgotPassword(email: string): Promise<void> {
    return this.perform(async () => {
      await sendPasswordResetEmail(this.requireAuth(), email);
      this.notice.show('Solicitação recebida. Confira sua caixa de entrada.');
    });
  }

  GoogleAuth(): Promise<void> { return this.AuthLogin(new GoogleAuthProvider()); }
  FacebookAuth(): Promise<void> { return this.AuthLogin(new FacebookAuthProvider()); }

  AuthLogin(provider: AuthProvider): Promise<void> {
    return this.perform(async () => {
      const result = await signInWithPopup(this.requireAuth(), provider);
      await this.saveProfile(result.user);
      await this.router.navigate(['/dashboard']);
    });
  }

  async SetUserData(user: User): Promise<void> {
    await setDoc(doc(this.firebase.db, 'user', user.uid), {
      id: user.uid, email: user.email, displayName: user.displayName,
      photoURL: user.photoURL, emailVerified: user.emailVerified
    }, { merge: true });
  }

  SignOut(): Promise<void> {
    return this.perform(async () => {
      await signOut(this.requireAuth());
      this.currentUser.set(null);
      this.state.next(null);
      await this.router.navigate(['/sign-in']);
    });
  }

  private requireAuth() {
    if (!this.firebase.auth) { throw new Error('Firebase não configurado. Consulte o README.'); }
    return this.firebase.auth;
  }

  private async saveProfile(user: User): Promise<void> {
    try { await this.SetUserData(user); }
    catch { this.notice.show('Sessão iniciada, mas não foi possível sincronizar o perfil.'); }
  }

  private async perform(operation: () => Promise<void>): Promise<void> {
    if (this.busy()) { return; }
    this.busy.set(true);
    this.notice.show('');
    try { await operation(); }
    catch (error) {
      const code = (error as { code?: string }).code;
      const messages: Record<string, string> = {
        'auth/invalid-credential': 'E-mail ou senha inválidos.',
        'auth/invalid-email': 'Informe um e-mail válido.',
        'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
        'auth/weak-password': 'Use uma senha com pelo menos seis caracteres.',
        'auth/too-many-requests': 'Muitas tentativas. Aguarde e tente novamente.',
        'auth/network-request-failed': 'Não foi possível conectar à autenticação.',
        'auth/popup-closed-by-user': 'A entrada foi cancelada.',
        'auth/operation-not-allowed': 'Este provedor de autenticação não está habilitado.'
      };
      this.notice.show(code ? (messages[code] ?? 'Não foi possível concluir a operação de autenticação.')
        : error instanceof Error ? error.message : 'Não foi possível concluir a operação.');
    } finally { this.busy.set(false); }
  }
}

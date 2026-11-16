import { readFile } from 'node:fs/promises';
import { after, before, beforeEach, test } from 'node:test';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';

let env;
before(async () => {
  env = await initializeTestEnvironment({ projectId: 'demo-personagens', firestore: {
    host: '127.0.0.1', port: 8080, rules: await readFile('firestore.local.rules', 'utf8')
  } });
});
after(async () => { await env?.cleanup(); });
beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async context => {
    await setDoc(doc(context.firestore(), 'personagem', 'helena'), { nome: 'Helena', userID: 'owner' });
  });
});

test('anônimo não lê nem grava personagens ou perfis', async () => {
  const db = env.unauthenticatedContext().firestore();
  await assertFails(getDoc(doc(db, 'personagem', 'helena')));
  await assertFails(setDoc(doc(db, 'personagem', 'novo'), { userID: 'owner' }));
  await assertFails(getDoc(doc(db, 'user', 'owner')));
});

test('proprietário lê e mantém seus registros, sem trocar a propriedade', async () => {
  const db = env.authenticatedContext('owner').firestore();
  await assertSucceeds(getDoc(doc(db, 'personagem', 'helena')));
  await assertSucceeds(getDocs(query(collection(db, 'personagem'), where('userID', '==', 'owner'))));
  await assertSucceeds(updateDoc(doc(db, 'personagem', 'helena'), { nome: 'Helena atualizada' }));
  await assertFails(updateDoc(doc(db, 'personagem', 'helena'), { userID: 'outro' }));
  await assertSucceeds(setDoc(doc(db, 'personagem', 'novo'), { nome: 'Novo', userID: 'owner' }));
  await assertFails(setDoc(doc(db, 'personagem', 'forjado'), { userID: 'outro' }));
  await assertSucceeds(deleteDoc(doc(db, 'personagem', 'novo')));
});

test('outro usuário não lê, modifica ou exclui personagens alheios', async () => {
  const db = env.authenticatedContext('outro').firestore();
  await assertFails(getDoc(doc(db, 'personagem', 'helena')));
  await assertFails(getDocs(collection(db, 'personagem')));
  await assertFails(updateDoc(doc(db, 'personagem', 'helena'), { nome: 'Intruso' }));
  await assertFails(deleteDoc(doc(db, 'personagem', 'helena')));
});

test('perfil só é acessível pelo próprio usuário e registros ausentes retornam ausência', async () => {
  const db = env.authenticatedContext('owner').firestore();
  await assertSucceeds(setDoc(doc(db, 'user', 'owner'), { id: 'owner' }));
  await assertSucceeds(getDoc(doc(db, 'user', 'owner')));
  await assertFails(getDoc(doc(db, 'user', 'outro')));
  await assertFails(setDoc(doc(db, 'user', 'outro'), { id: 'owner' }));
  await assertSucceeds(getDoc(doc(db, 'personagem', 'ausente')));
});

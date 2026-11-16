export class Personagem {
  id = '';
  nome = '';
  resumo = '';
  dataCriacao: Date | { toDate(): Date } | null = null;
  userID = '';
}

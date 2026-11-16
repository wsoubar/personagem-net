# AGENTS.md — Guia do projeto

## Comunicação e escopo

- Use português do Brasil nas respostas e na documentação; preserve comandos, APIs e identificadores existentes.
- Inspecione o código antes de alterar arquivos. Faça mudanças pequenas e relacionadas à solicitação, preservando trabalho preexistente.
- Não faça commits, pushes ou crie branches sem solicitação explícita.
- Antes de remover aplicações, ferramentas, pacotes ou seus arquivos e dados, apresente caminhos e efeitos e aguarde autorização explícita no chat após o plano.

## Contexto e organização

- Protótipo `personagens`: autenticação Firebase, perfil e consulta de personagens por proprietário. Inclusão, gravação de edição, exclusão pela interface e feed permanecem incompletos.
- Stack: Angular 22 com `NgModule`, TypeScript 6, RxJS 7, SDK modular Firebase 13, Bootstrap 5 e Font Awesome 4. Não migre a arquitetura nem acrescente funcionalidades sem necessidade da tarefa.
- Node.js 24, a partir de 24.15.0, conforme `.nvmrc` e `package.json`. Use o lockfile para instalações reproduzíveis.
- `src/app/app.module.ts`: componentes e módulos; `shared/routing/`: rotas e guards.
- `src/app/components/`: autenticação, dashboard e feed; `src/app/personagem/`: telas de personagens.
- `src/app/shared/services/`: estado de autenticação, Firebase modular, mensagens e acesso a dados; `shared/model/`: modelos.
- `src/config/`: ambientes e exemplo de configuração Web pública. Os antigos `src/environments/` não são usados.
- `tests/`: regras Firestore e Playwright. Testes unitários `*.spec.ts` próximos ao código usam Vitest pelo builder Angular.
- As configurações legadas de Karma, Protractor, TSLint, `src/polyfills.ts` e `src/test.ts` estão preservadas como histórico, fora dos comandos atuais. Não reative essas ferramentas por engano.

## Convenções

- Respeite `.editorconfig`: UTF-8, dois espaços e quebra de linha final. Use aspas simples e ponto e vírgula no TypeScript.
- Preserve componentes com arquivos `.ts`, `.html` e `.scss`, `standalone: false`, prefixo `app` e registro no módulo. Evite reformatação ampla sem necessidade.
- Use sinais ou AsyncPipe para notificar o Angular sem Zone.js; cancele assinaturas com o ciclo de vida.
- Preserve as coleções `user` e `personagem`, IDs, campos e URLs existentes. Mudanças de contrato exigem análise explícita dos dados existentes.
- O SDK Firebase é a fonte da sessão. Não confie em valores do `localStorage` nem em guards para autorizar operações no banco.
- Há overrides de segurança de dependências transitivas. Reavalie-os com auditoria e testes dos emuladores ao atualizar pacotes. Não aplique correções forçadas sem analisar compatibilidade.

## Ambiente e dados externos

- Desenvolvimento usa exclusivamente `demo-personagens`, Authentication em `127.0.0.1:9099` e Firestore em `127.0.0.1:8080`.
- Produção carrega `assets/firebase-config.local.json`; sem configuração, bloqueia operações. O exemplo está em `src/config/firebase-config.example.json` e o arquivo local é ignorado pelo Git.
- Não versione senhas, tokens, sessões ou contas de serviço. Não leia nem altere credenciais em `.aws/` ou outros diretórios privados sem necessidade explícita.
- Não altere dados, usuários, provedores ou regras remotas sem autorização. `firestore.local.rules` é proposta para emuladores, sem validação contra o Firebase real.
- Preserve arquivos históricos, notas e recursos estáticos. O único lockfile ativo é `package-lock.json`.

## Comandos e validação

Execute na raiz com Node 24:

| Objetivo | Comando |
| --- | --- |
| Instalar conforme o lockfile | `npm ci` |
| Emuladores locais (Java 21+) | `npm run emulators` |
| Servidor de desenvolvimento, porta 4200 | `npm start` |
| Build de produção | `npm run build` |
| Lint TypeScript | `npm run lint` |
| Testes unitários | `npm test` |
| Regras com emuladores | `npm run test:rules` |
| Instalar navegador de teste | `npx playwright install chromium` |
| Fluxo completo no navegador e emuladores | `npm run e2e` |
| Auditoria de dependências | `npm audit` |

- `test:rules` e `e2e` gerenciam seus emuladores; não execute simultaneamente nem com emuladores manuais nas mesmas portas.
- O build gera `dist/personagens/browser/`. Não versione artefatos, dados locais, cobertura ou relatórios de teste.
- Execute checks relevantes à mudança e revise os diffs. Build e lint não comprovam autenticação nem persistência.
- Separe resultados locais de validação de produção. Provedores sociais reais, dados existentes, regras remotas e fechamento do alerta no GitHub exigem verificações externas.

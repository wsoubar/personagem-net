# Personagens

Protótipo iniciado em 2019 para autenticar usuários e listar seus personagens com Firebase Authentication e Cloud Firestore. O dashboard mostra a conta e consulta personagens pelo campo `userID`.

**Implementado:** entrada e cadastro por e-mail/senha, recuperação e verificação de e-mail, integração com Google/Facebook, sessão persistida pelo SDK Firebase, listagem e leitura de personagens. Google e Facebook exigem provedores configurados no projeto real.

**Incompleto:** inclusão, gravação de edição, exclusão pela interface e feed. Essas telas continuam identificadas como protótipo; a recuperação técnica não acrescentou essas funcionalidades.

## Requisitos e execução local

- Node.js 24, a partir de 24.15.0; `nvm use` seleciona a linha indicada em `.nvmrc`.
- npm 10 ou superior.
- Java 21 ou superior para o emulador Firestore.

```sh
nvm use
npm ci
npm run emulators
```

Em outro terminal:

```sh
npm start
```

Abra `http://localhost:4200`. O desenvolvimento usa **somente** o projeto fictício `demo-personagens`, com Authentication em `127.0.0.1:9099` e Firestore em `127.0.0.1:8080`. Não precisa de login no Firebase CLI nem de credenciais reais. Os dados de teste são descartados quando os emuladores encerram; links de verificação e recuperação aparecem no terminal do emulador.

## Verificações

```sh
npm run lint
npm test
npm run build
npm run test:rules
npx playwright install chromium
npm run e2e
npm audit
```

`test:rules` e `e2e` iniciam e encerram seus próprios emuladores. Encerre uma execução manual de `npm run emulators` antes de usá-los. O teste de navegador também inicia o servidor Angular e um servidor local do build de produção; as portas 4200, 4300, 8080 e 9099 devem estar livres. A primeira execução baixa binários públicos dos emuladores e do navegador.

O cenário de produção também confirma que, sem configuração, nenhuma chamada externa é feita. Os testes cobrem restauração de sessão, rejeição de `localStorage` forjado, cadastro, verificação e recuperação de e-mail, entrada e saída, leitura por proprietário, documentos ausentes, datas ausentes, acesso negado e navegação móvel. As regras locais têm testes de isolamento entre usuários e preservação de propriedade. Esses resultados não comprovam a segurança das regras do Firebase remoto.

## Build de produção e configuração real

```sh
npm run build
```

A saída fica em `dist/personagens/browser/`. O build de produção não usa emuladores. Na ausência de configuração, a interface informa que o Firebase não está configurado e bloqueia as operações, sem escolher um projeto real automaticamente.

Para preparar uma integração real, copie `src/config/firebase-config.example.json` para `src/assets/firebase-config.local.json` e preencha os valores públicos da configuração Web fornecida pelo Firebase. Esse arquivo é ignorado pelo Git e será copiado para os assets pelo build. Uma hospedagem também pode disponibilizar o JSON em `assets/firebase-config.local.json` junto à aplicação. O arquivo é lido antes da inicialização e não deve conter senhas, tokens de sessão ou chaves de conta de serviço.

Os antigos `src/environments/` não são mais usados. Nenhum projeto real foi identificado ou alterado nesta recuperação. Antes de conectar uma implantação, confirme o projeto, os domínios autorizados, provedores de login e regras existentes. A hospedagem deve encaminhar URLs da aplicação para `index.html`, preservando arquivos estáticos. O teste completo de produção e dos provedores sociais depende dessa configuração.

## Segurança e compatibilidade

A base foi migrada de Angular 8 para Angular 22, Firebase modular e Bootstrap 5, mantendo `NgModule` e serviços. Foram preservadas as coleções `user` e `personagem`, os IDs e os campos existentes, incluindo `userID` e datas Firestore. As URLs existentes foram mantidas.

O estado de autenticação vem do SDK Firebase; o antigo item `user` do `localStorage` é ignorado. Guards aguardam a sessão e retornam autorização ou redirecionamento. A verificação de e-mail continua disponível sem passar a ser requisito para acessar a conta.

`firestore.local.rules` é uma proposta **apenas para validação local**, com acesso limitado ao proprietário. Não execute deploy dessas regras sem revisar o projeto real e seus dados. A configuração `firebase.json` existe para os emuladores, não representa uma implantação aprovada.

O alerta CVE-2026-119192 vinha de `@angular-devkit/build-angular → webpack-dev-server → selfsigned → node-forge 0.7.5`. A árvore antiga foi substituída e não contém mais Forge. Consulte [o advisory do mantenedor](https://github.com/digitalbazaar/forge/security/advisories/GHSA-6qrw-m8cv-hcxf).

Há overrides explícitos para versões corrigidas de `@grpc/grpc-js`, `glob`, `uuid` e `@opentelemetry/core`. Eles cobrem dependências transitivas cujos pacotes pais ainda restringem versões vulneráveis. As trocas de versão principal de Glob, UUID e OpenTelemetry exigem atenção: os fluxos utilizados aqui foram testados; outros comandos do Firebase CLI, como deploy, não foram validados. Reavalie os overrides ao atualizar os pacotes pais; não use `npm audit fix --force` sem revisar os impactos.

As configurações e os testes legados de Karma, TSLint e Protractor foram removidos, junto com arquivos auxiliares sem uso. As notas e imagens históricas foram preservadas. O lockfile usado pelo npm é exclusivamente `package-lock.json`.

## Organização

- `src/app/components/`: autenticação, perfil e feed.
- `src/app/personagem/`: telas de personagens.
- `src/app/shared/`: serviços, guards, modelos e rotas.
- `src/config/`: seleção de ambiente e exemplo de configuração pública.
- `tests/`: regras locais e testes de navegador atuais.

Nenhum commit, push ou deploy é necessário para executar localmente. O fechamento do alerta no GitHub depende de publicar as mudanças autorizadas e de uma nova análise do Dependabot.

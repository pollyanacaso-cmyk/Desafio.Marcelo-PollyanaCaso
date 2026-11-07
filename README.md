# Login com access_token (JWT)

Aplicação com API em Node.js/Express que autentica um usuário e devolve um `access_token` JWT, mais uma interface web para testar o fluxo.

## Tecnologias

- Node.js e Express
- JSON Web Token (`jsonwebtoken`)
- bcryptjs (hash de senha)
- dotenv (variáveis de ambiente)
- HTML, CSS e JavaScript puro no front-end

## Estrutura

```text
jwt-auth-app/
├── public/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── src/
│   ├── data/users.js
│   ├── middleware/requireAuth.js
│   ├── routes/auth.routes.js
│   ├── app.js
│   └── config.js
├── .env.example
├── package.json
└── server.js
```

## Como executar

Requer Node.js 18 ou superior.

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Crie o arquivo `.env` a partir do exemplo e troque o `JWT_SECRET`:

   ```env
   PORT=3000
   JWT_SECRET=troque-por-uma-chave-longa-e-aleatoria
   JWT_EXPIRES_IN=15m
   ```

3. Inicie o servidor:

   ```bash
   npm start
   ```

4. Acesse http://localhost:3000

## Credenciais de teste

- E-mail: `demo@exemplo.com`
- Senha: `senha123`

## Rotas da API

| Método | Rota             | Proteção | Descrição                                      |
|--------|------------------|----------|------------------------------------------------|
| POST   | `/api/auth/login`| Pública  | Valida e-mail e senha e devolve o access_token |
| GET    | `/api/auth/me`   | Bearer   | Valida o token e devolve os dados do usuário   |

### Login

```http
POST /api/auth/login
Content-Type: application/json

{ "email": "demo@exemplo.com", "password": "senha123" }
```

Resposta (200):

```json
{
  "access_token": "eyJhbGciOi...",
  "token_type": "Bearer",
  "expires_in": "15m"
}
```

### Rota protegida

```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

Resposta (200):

```json
{
  "id": 1,
  "name": "Usuária Demo",
  "email": "demo@exemplo.com",
  "token_expires_at": "2026-11-06T15:30:00.000Z"
}
```

## Testando no Insomnia ou Postman

1. Crie um `POST http://localhost:3000/api/auth/login` com corpo JSON e as credenciais acima.
2. Copie o `access_token` da resposta.
3. Crie um `GET http://localhost:3000/api/auth/me`, abra a aba Authorization, escolha **Bearer Token** e cole o token.

## Códigos de resposta

| Situação                          | Status |
|-----------------------------------|--------|
| Login correto                     | 200    |
| E-mail ou senha vazios            | 400    |
| E-mail ou senha incorretos        | 401    |
| Token não informado               | 401    |
| Token inválido                    | 401    |
| Token expirado                    | 401    |

## Como funciona

1. O servidor busca o usuário pelo e-mail e compara a senha com o hash salvo (bcrypt).
2. Se estiver correto, gera um JWT assinado com o `JWT_SECRET`, contendo o id e o nome do usuário e a data de expiração.
3. O front-end guarda o token em `sessionStorage` e o envia no header `Authorization: Bearer` nas chamadas protegidas.
4. O middleware `requireAuth` verifica a assinatura e a validade do token antes de liberar a rota.

## Observações

- O arquivo `.env` contém dados privados e não deve ser enviado ao GitHub (já está no `.gitignore`).
- O usuário é fixo e serve apenas para demonstração. Em um sistema real, os usuários ficariam em um banco de dados.

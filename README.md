# brev.ly-server

API para encurtamento e redirecionamento de URLs construída com Fastify, Drizzle ORM e PostgreSQL. Inclui rotas para criar URLs curtas, redirecionamentos e realizar downloads, com validação via Zod e testes em Vitest.

## Requisitos

- Node.js 24.x (obrigatório para executar TypeScript nativamente)
- pnpm
- PostgreSQL (local) ou Docker/Docker Compose

Dica: fixe o Node 24 localmente com `nvm use` para instalar a versão indicada no arquivo `.nvmrc`.

## Configuração

Crie um arquivo `.env` na raiz com, no mínimo:

```ini
HOST=0.0.0.0
PORT=3000
DATABASE_URL=postgres://brevly_user:brevly_password@localhost:5432/brevly_db
```

Se usar Docker Compose, o host do banco dentro do compose é `db`:

```ini
DATABASE_URL=postgres://brevly_user:brevly_password@db:5432/brevly_db
```

Instale as dependências:

```bash
pnpm install
```

## Executar localmente (Node 24)

```bash
pnpm dev
```

- O servidor escuta em `HOST:PORT` (padrão `0.0.0.0:3000`).
- Certifique-se de que o PostgreSQL esteja acessível pelo `DATABASE_URL`.

## Executar com Docker Compose (recomendado)

```bash
docker compose up --build
```

Variáveis de ambiente podem ser ajustadas no `docker-compose.yml` ou `.env`.

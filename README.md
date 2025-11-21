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

## Executar localmente

Ambiente que não suporta Node >=24 nativo para TS:

```bash
pnpm build
pnpm start
```

Ambiente com Node 24+ (suporte a `--watch` e execução direta de TS):

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

## Scripts

- `pnpm build`: compila para JS em `dist/`.
- `pnpm start`: executa `dist/server.mjs`.
- `pnpm dev`: executa TS diretamente com watch (node 24+).
- `pnpm test`: roda testes (vitest).

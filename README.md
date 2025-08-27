
# Database:
- Mongodb
- Redis
- Qdrant
- Postgres

# Fastapp: 
- uv
- unicorn
- Fastapi
- Beanie
- strawberry graphQL

#### run:
- edit file `fastapp/.env`

```bash
uv run main.py
```

# ui:
- vitejs
- React
- antd
- apollo graphql
- websocket
- user login
- react redux

#### run:
- proxy: `ui/vite.config.ts`

```bash
yarn dev
yarn build
```

# nginx: 
- `ui/public/nginx.conf` is nginx config proxy routes


# Docker compose
#### run:
```bash
docker compose up -d
```

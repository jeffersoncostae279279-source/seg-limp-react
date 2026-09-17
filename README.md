# SEG&LIMP — Atividade 2

Projeto acadêmico em React/Vite para a disciplina de Desenvolvimento Web.

## Funcionalidades
- Navegação SPA com React Router.
- Cadastro de denúncias.
- Eventos e formulários controlados por React.
- Estado global da aplicação por hooks (`useState` e `useEffect`).
- Persistência local com `localStorage`.
- Filtro e atualização de status.
- Consulta de CEP usando Fetch API + BrasilAPI.
- Tratamento de resposta JSON e erros.
- Geolocalização do navegador.
- Layout responsivo.

## Executar
```bash
npm install
npm run dev
```

## Gerar produção
```bash
npm run build
```

## API
Endpoint utilizado:
`https://brasilapi.com.br/api/cep/v2/{CEP}`

A aplicação usa `fetch()`, valida a resposta HTTP, converte com `response.json()` e trata erros com `try/catch`.

## Publicação
Depois de subir o projeto para GitHub, ele pode ser publicado na Vercel, Netlify ou outro serviço indicado pelo professor.

| Etapa                                      | Status | Descrição                           |
| ------------------------------------------ | ------ | ----------------------------------- |
| Middleware de erro no final                | [x]    | Confirme `app.use(errorMiddleware)` |
| Rotas `/refresh-token` e `/logout` criadas | [x]    | Devem estar com `POST`              |
| `cookie-parser` ativo                      | [x]    | Necessário para ler cookies         |
| `.env` configurado                         | [x]    | JWT/REFRESH/BASE_URL definidos      |
| `refreshAccessTokenRef` no frontend        | [x]    | Atualiza o token de acesso          |
| `axios.interceptors` configurado           | [x]    | Faz o refresh automático            |
| `localStorage` limpo de tokens             | [x]    | Evita conflito entre tokens         |

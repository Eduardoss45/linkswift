# Lista de Tarefas para Refatoração de Autenticação

Esta lista de tarefas descreve as alterações necessárias para alinhar o sistema de autenticação e redirecionamento de links privados com as melhores práticas descritas nos documentos de referência. O objetivo é mover de um sistema que armazena JWT em `localStorage` para um que utiliza cookies `httpOnly` para o *refresh token* e armazena o *access token* em memória.

## Backend

### 1. Simplificar o Middleware de Autenticação
- **Arquivo:** `backend/src/middlewares/authMiddleware.ts`
- **Função:** `authenticateToken`
- **Tarefa:** Modificar a função para que ela valide **apenas** o `accessToken` enviado através do cabeçalho `Authorization: Bearer <token>`. A lógica de verificar tokens em cookies (`refreshToken`) deve ser removida deste middleware, pois sua única responsabilidade deve ser validar o acesso a rotas protegidas, enquanto o `refreshToken` deve ser usado exclusivamente na rota `/refresh-token`.

### 2. Ajustar o Controlador de Links Privados
- **Arquivo:** `backend/src/controllers/linkPrivateController.ts`
- **Função:** `redirectPrivateLink`
- **Tarefa:** Alterar a função para que, em vez de fazer um `res.redirect()`, ela retorne uma resposta JSON contendo a URL de destino. O frontend fará uma chamada autenticada para esta rota, e se o usuário for o proprietário do link, o backend devolverá a URL para que o frontend execute o redirecionamento.

```typescript
// Exemplo de como deve ficar
export const redirectPrivateLink = async (req: Request, res: Response) => {
  const { key } = req.params;
  const userId = req.user?._id?.toString();
  
  // ... (lógica para buscar o link no cache/DB) ...

  if (link.criado_por.toString() !== userId) {
    return res.status(403).json({ message: 'Acesso negado.' });
  }

  // Em vez de res.redirect(link.url);
  return res.status(200).json({ url: link.url });
};
```

### 3. Limpar Rotas Não Utilizadas
- **Arquivo:** `backend/src/routes/linkRoute.ts`
- **Tarefa:** Remover a rota `router.get('/redirect/:short_id', redirectPrivateLinkWithCookie);` e a função `redirectPrivateLinkWithCookie` do arquivo `backend/src/controllers/linkPrivateController.ts`, pois ela parece ser um resquício de uma implementação anterior e não se encaixa no fluxo atual.

## Frontend

### 1. Adicionar o Access Token às Requisições
- **Arquivo:** `frontend/src/hooks/useUsers.ts` (ou onde a instância do Axios é criada)
- **Tarefa:** Configurar um interceptor no Axios para adicionar o `accessToken` (obtido do `authStore`) a todas as requisições enviadas para a API. Atualmente, o token é salvo no estado, mas não é anexado aos cabeçalhos, fazendo com que as chamadas para rotas protegidas falhem.

```typescript
// Exemplo de interceptor no useUsers.ts
api.interceptors.request.use(
  config => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);
```

### 2. Refatorar a Lógica de Redirecionamento de Links
- **Arquivo:** `frontend/src/hooks/useLinks.ts`
- **Função:** `redirectToLink`
- **Tarefa:** Modificar a função para lidar com os diferentes tipos de links de acordo com a nova abordagem do backend.
  - **Links Públicos:** Continuar redirecionando diretamente (`/r/:key`).
  - **Links Protegidos por Senha:** Manter o fluxo atual, enviando a senha para `/protected/:key?senha=...`.
  - **Links Privados:**
    1. Fazer uma chamada `GET` autenticada (com o `accessToken` no cabeçalho) para a rota `/private/:key`.
    2. Se a chamada for bem-sucedida, o backend retornará um JSON com a URL de destino (ex: `{ "url": "https://..." }`).
    3. Usar a URL recebida para fazer o redirecionamento no lado do cliente com `window.location.href = response.data.url;`.

### 3. Remover o Uso de `localStorage` (Verificação)
- **Arquivo:** `frontend/src/store/authStore.ts`
- **Tarefa:** Garantir que não há persistência do estado do `authStore` em `localStorage` ou `sessionStorage`. A implementação atual parece correta, mantendo o estado apenas em memória, mas é bom confirmar que nenhum middleware de persistência do Zustand está sendo usado.
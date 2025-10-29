# Documentação: One-Time Handshake para Links Privados

## 1. **Objetivo**

Proteger links privados contra vazamento de tokens via URL (`GET`) e garantir que:

* Somente quem possui o token possa acessar o link.
* O token não fique exposto em logs, referrers ou screenshots.
* Possível integração com **usuário autenticado via JWT**.

Fluxo resumido:

1. Usuário clica no link privado.
2. Token não é enviado diretamente para redirecionamento final.
3. Servidor valida token via **POST** (corpo da requisição).
4. Servidor cria **cookie temporário** que permite o redirecionamento seguro.
5. Redirecionamento para URL original ocorre sem expor o token na URL.

---

## 2. **Arquitetura**

| Componente            | Função                                                                           |
| --------------------- | -------------------------------------------------------------------------------- |
| **MongoDB**           | Armazena links privados (`short_id`, `token`, `url_original`, `expira_em`, etc.) |
| **Redis**             | Cache rápido para tokens válidos e TTL, contador de acessos                      |
| **Express (Node.js)** | API de handshake, validação de token, criação de cookie                          |
| **JWT**               | Autenticação do usuário (mantida para links que exigem login)                    |
| **Browser**           | Recebe cookie temporário e é redirecionado automaticamente                       |

---

## 3. **Modelo de Dados**

MongoDB (coleção `links`):

```json
{
  "_id": ObjectId,
  "short_id": "abc123",
  "url_original": "https://meusite.com/artigo",
  "privado": true,
  "token": "aZ3kL9bT2qW1",
  "expira_em": "2025-11-30T23:59:59Z",
  "acessos": 0,
  "ownerId": ObjectId   // opcional, caso seja restrito a usuário
}
```

Redis:

* Key: `handshake:${short_id}:${token}`
* Value: URL original ou metadados (expira_em, ownerId)
* TTL: opcional, geralmente igual ao `expira_em` ou 60s para one-time

---

## 4. **Fluxo de One-Time Handshake**

1. Usuário abre link privado:
   `https://encurta.io/open/abc123`
2. Servidor retorna **página de handshake**, pedindo token no corpo do POST (não na URL).
3. Usuário envia token via **POST /verify**.
4. Servidor valida:

   * Token existe no Mongo ou Redis.
   * Link não expirou.
   * (Opcional) Token pertence ao usuário autenticado (JWT).
5. Servidor cria **cookie temporário** (httpOnly, secure, SameSite).
6. Servidor responde com redirecionamento **302** para URL original.
7. Navegador redireciona sem expor token na URL.
8. Cookie expirado após uso ou TTL.

---

## 5. **Endpoints Express (Exemplo)**

### a) Página de Handshake

```js
// GET /open/:short_id
app.get('/open/:short_id', (req, res) => {
  const { short_id } = req.params;
  // Renderiza página simples pedindo token (form POST)
  res.send(`
    <form action="/verify" method="POST">
      <input type="hidden" name="short_id" value="${short_id}" />
      <label>Token do link:</label>
      <input name="token" required />
      <button type="submit">Abrir link</button>
    </form>
  `);
});
```

---

### b) Endpoint de Verificação e Criação de Cookie

```js
import cookieParser from 'cookie-parser';
app.use(cookieParser());

app.post('/verify', async (req, res) => {
  const { short_id, token } = req.body;
  const userId = req.user?.id; // JWT autenticado, se aplicável

  // Busca link no Redis ou Mongo
  const cacheKey = `handshake:${short_id}:${token}`;
  let url = await redis.get(cacheKey);

  if (!url) {
    // Consulta MongoDB
    const link = await Link.findOne({ short_id, token });
    if (!link) return res.status(401).send('Token inválido');
    if (link.expira_em && new Date(link.expira_em) < new Date())
      return res.status(410).send('Link expirado');

    // Verifica dono do link se necessário
    if (link.ownerId && userId && link.ownerId.toString() !== userId)
      return res.status(403).send('Não autorizado');

    url = link.url_original;

    // Salva no Redis para one-time handshake
    await redis.set(cacheKey, url, 'EX', 60); // TTL 60s
  }

  // Cria cookie temporário httpOnly
  res.cookie(`auth_${short_id}`, token, {
    httpOnly: true,
    secure: true,     // HTTPS obrigatório
    sameSite: 'lax',
    maxAge: 60000     // 1 minuto
  });

  // Redireciona para URL original
  res.redirect(url);
});
```

---

### c) Redirecionamento com Cookie

Para endpoints futuros (caso queira validar o cookie):

```js
app.get('/redirect/:short_id', async (req, res) => {
  const { short_id } = req.params;
  const token = req.cookies[`auth_${short_id}`];
  if (!token) return res.status(401).send('Autorização necessária');

  const link = await Link.findOne({ short_id, token });
  if (!link) return res.status(404).send('Link não encontrado');

  // Incrementa contador
  link.acessos += 1;
  await link.save();

  // Remove cookie para one-time
  res.clearCookie(`auth_${short_id}`);
  res.redirect(link.url_original);
});
```

---

## 6. **Integração com JWT de usuário**

* Se o link exige que apenas o dono acesse:

  1. Middleware JWT (`auth`) já popula `req.user`.
  2. Durante `POST /verify` valida `link.ownerId === req.user.id`.
* Para links compartilháveis entre qualquer pessoa: JWT não é necessário.

---

## 7. **Boas práticas**

1. **Segurança**

   * Cookie `httpOnly` e `secure`.
   * TTL curto (ex: 60s) para token no Redis e cookie.
   * Evitar colocar token em URL.
2. **Escalabilidade**

   * Redis para handshake rápido e expiração automática.
   * MongoDB mantém histórico e persistência.
3. **One-time**

   * Remover token do Redis após uso ou marcar usado no Mongo.
4. **Auditoria**

   * Registrar IP, user-agent e user_id (se JWT presente).
## 🔗 Link de Teste

```link
https://pt.aliexpress.com/item/1005002308952741.html?src=google&pdp_npi=4%40dis!BRL!51.96!47.79!!!!!%40!12000035782759099!ppc!!!&src=google&albch=shopping&acnt=768-202-3196&isdl=y&slnk=&plac=&mtctp=&albbt=Google_7_shopping&aff_platform=google&aff_short_key=UneMJZVf&gclsrc=aw.ds&&albagn=888888&&ds_e_adid=&ds_e_matchtype=&ds_e_device=c&ds_e_network=x&ds_e_product_group_id=&ds_e_product_id=pt1005002308952741&ds_e_product_merchant_id=107568597&ds_e_product_country=BR&ds_e_product_language=pt&ds_e_product_channel=online&ds_e_product_store_id=&ds_url_v=2&albcp=21106536414&albag=&isSmbAutoCall=false&needSmbHouyi=false&gad_source=1&gclid=CjwKCAjwp8--BhBREiwAj7og17xjr0O4Sj6qVLkhJ23z5UZFTrc3dt1Dt8sxwKmOE6dRQG98FZI4rBoCrLEQAvD_BwE
```

---

## Estrutura

## 🧱 Estrutura da Requisição

```json
{
  "url": "", // ✅ URL original (não pode ser do mesmo domínio do LinkSwift)
  "id": "", // 🔐 ID do usuário (opcional - omitido se não autenticado)
  "private": true, // 🔒 Define se o link é privado
  "password": "12345" // 🔑 Senha opcional (para links públicos ou privados)
}
```

---

## 🔮 Funcionalidades em Desenvolvimento

- [ ] Personalizar link curto manualmente (`customAlias`)
- [x] Definir senha para acesso ao link
- [ ] Estipular datas de validade (início/fim)
- [ ] Gerar código QR (QRCode) para o link encurtado
- [x] Implementar autenticação via email
- [x] Implementar remoção automatica de chave de links do modelo usuário em conjunto com o redis
- [ ] Implementar sistemas de remoção de tokens de redefinição de senha e sistema de reenvio de codigo de verificação no backend
- [ ] Revisar logica dos formularios e mensagens
- [ ] Incluir contexto na verificação de codigo com o email logado anteriormente
- [ ] No backend, mesmo com verificação no frontend, nunca confie só no frontend.
      Proteja rotas sensíveis no backend com algo assim:

```js
if (!user.verificado) {
  return res.status(403).json({ message: 'Conta não verificada.' });
}
```

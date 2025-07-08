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
- [ ] Estipular datas de validade para links (início/fim)
- [ ] Gerar código QR (QRCode) para o links

---

## Como implementar essa "isca" de forma eficiente

### 1. Mostrar um toast (notificação rápida) após encurtar o link com sucesso

- Exemplo:

  > **Link encurtado com sucesso!** Para funcionalidades extras, [acesse sua conta](#).

### 2. Link clicável na notificação que leva à tela de login/cadastro

- Você pode usar o `toast` do `sonner` (já importado no seu projeto) com conteúdo customizado:

```tsx
import { toast } from 'sonner';

function encurtarLink() {
  // lógica do encurtador aqui...

  toast(
    t => (
      <div>
        Link encurtado com sucesso!{' '}
        <button
          className="underline text-cyan-400"
          onClick={() => {
            navigate('/login');
            toast.dismiss(t.id);
          }}
        >
          Para funcionalidades extras, acesse sua conta clicando aqui!
        </button>
      </div>
    ),
    { duration: 8000 } // dura 8 segundos, por exemplo
  );
}
```

---

### 3. Dicas para o texto da notificação / isca

- Seja claro e objetivo.
- Use uma call to action (CTA) curta e fácil de entender.
- Faça o texto visualmente destacado (cores, sublinhado, cursor pointer).
- Não exagere para não irritar o usuário.

---

### 4. Outros gatilhos de engajamento para considerar

- **Limite de links encurtados para usuários anônimos**, sugerindo cadastro para mais.
- **Funcionalidades premium**: estatísticas detalhadas, links personalizados, histórico, etc.
- **Banner fixo ou modal suave** com convite para criar conta após 1-2 encurtamentos.

- [ ] Ajustar o menu flutuante.

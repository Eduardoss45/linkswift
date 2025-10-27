## Desenvolver

- [ ] Encurtar links
- [ ] Responsividade em telas pequenas médias e grandes
- [ ] Personalizar link curto manualmente (`customAlias`)
- [ ] Estipular datas de validade para links (início/fim)
- [ ] Gerar código QR (QRCode) para o links
<!-- ! - [ ] Painel para criação de landigpages (Não faço ideia de como fazer. Mas eu acho que bastaria criar varios templates com handlebars por exemplo e permitir personalização?) -->
- [ ] Atração para os usuários

- Exemplo:

> **Link encurtado com sucesso!** Para funcionalidades extras, [acesse sua conta](#).

```tsx
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
  { duration: 8000 }
);
```

- Principais pontos:

- Ser claro e objetivo.
- Use uma call to action (CTA) curta e fácil de entender.
- Faça o texto visualmente destacado (cores, sublinhado, cursor pointer).
- Não exagere para não irritar o usuário.

- Sugestões:

- **Limite de links encurtados para usuários anônimos**, sugerindo cadastro para mais.
- **Funcionalidades premium**: estatísticas detalhadas, links personalizados, histórico, etc.
- **Banner fixo ou modal suave** com convite para criar conta após 1-2 encurtamentos.
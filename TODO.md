## Desenvolver

- [] Encurtar links

- Exemplo:

```json
{
  "id": "", // ID do link
  "criado_por": "", // ID do usuário (opcional - omitido se não autenticado)
  "de": "", // URL original (não pode ser do mesmo domínio do LinkSwift)
  "para": "", // URL encurtada (não pode ser do mesmo domínio do LinkSwift)
  "senha": "12345", // Senha opcional (para links públicos)
  "privado": false // Definido por padrão, muda deacordo com as configurações do usuário
}
```

- [ ] Responsividade em telas pequenas médias e grandes
- [ ] Personalizar link curto manualmente (`customAlias`)
- [ ] Estipular datas de validade para links (início/fim)
- [ ] Gerar código QR (QRCode) para o links
<!-- ! - [ ] Painel para criação de landigpages -->
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

- [ ] Configurações

- Alterar e-mail e senha
- Gerenciar autenticação em dois fatores (2FA) (se quiser implementar no futuro)
- Configurar domínios personalizados (para URLs)
- Definir preferências de privacidade (ex: tornar links privados por padrão)
- Preferências de notificação (avisos sobre cliques, validade de links, etc.)
- Excluir conta

[Usuário acessa link curto] 
      ↓
[Serviço de redirecionamento rápido (cache + DB leve)]
      ↓
[Redireciona para URL original]

[Evento de clique enviado para fila/logs] → [Sistema de processamento de logs (Kafka, Spark, etc)] → [Banco analítico / dashboard]

[Serviço de métricas lê do banco analítico + DB principal para relatórios]

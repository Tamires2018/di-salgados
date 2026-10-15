# Fechamento manual

Antes de publicar o frontend, execute `migrations/202610140001_manual_store_closure.sql`
no SQL Editor do mesmo projeto Supabase usado pelo aplicativo. Execute uma vez.
Sem essa configuração, o aplicativo bloqueia novos pedidos por não conseguir
consultar o funcionamento.

No painel administrativo, use **Fechar loja agora** e confirme a senha atual do
administrador. O fechamento é compartilhado entre dispositivos, permanece durante
férias e após recarregar a página. **Retomar horário automático** remove a pausa;
os horários e feriados existentes continuam valendo. Isso não fecha o caixa e não
cancela pedidos existentes. Clientes consultam o status a cada cinco segundos e
ao voltar para a página. O checkout consulta novamente antes de enviar e o banco
rejeita novos pedidos durante a pausa.

A função de alteração valida no banco a senha do login administrativo atual,
armazenada apenas como hash em uma tabela sem acesso público. Se essa senha mudar,
atualize também o hash via SQL Editor:

```sql
update public.store_admin_credentials
set password_hash = extensions.crypt('NOVA_SENHA', extensions.gen_salt('bf'))
where id = 1;
```

Validação após aplicar o SQL: feche no painel e abra o cardápio em outro aparelho;
verifique o aviso e os botões desabilitados. Tente finalizar um carrinho aberto
antes da pausa. Retome o horário automático e verifique que pedidos só são
liberados dentro do horário já definido em `src/utils/businessHours.js`.

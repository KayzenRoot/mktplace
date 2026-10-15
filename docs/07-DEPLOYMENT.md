# Deployment
**Estado:** NÃO provisionado, nenhum domínio e nenhum ambiente de produção ativo.
## Plano
- Frontend/BFF/route handlers Next.js rodando em Node.js, recomendado hosting HTTPS gerenciado (Vercel) com deployment via PR preview.
- PostgreSQL gerenciado com TLS, conexão server-only, backups automáticos e segregação dev/prod.
- Auth.js OIDC Google como identidade sugerida (apenas owner allowlisted + MFA habilitado). Ativação depende do proprietário.
- Produção: `https://<DOMINIO>/api/integrations/bling/callback` cadastrada EXATAMENTE no app privado Bling.
- Preview não poderá usar credenciais/token de produção nem fazer callback da conta real; testes via mocks e Bling app segregado.
## Etapas
1. Criar ambiente e hostname HTTPS, banco, fornecedor OIDC, configurar scopes mínimos no Bling (Owner-only).
2. Adicionar secrets em cofre da plataforma, nunca em PR ou `.env` versionado.
3. Deploy de branch de WO e checks obrigatórios; revisão e merge; deploy produção com healthcheck.
4. Autorizar Bling pelo proprietário no UI; smoke GET read-only; registrar evidence bundle sem payload.
5. Definir alertas auth/refresh/API; backups e restore drill antes de módulos financeiros.
## Proibições
Sem acesso à API Bling via navegador, sem `NEXT_PUBLIC_*` para segredos, sem rotas de debug em produção, sem fornecer token pelo chat, sem testes destrutivos ou fiscal em produção.
## Rollback
Reverter deployment para build anterior apenas quando schema compatível; migrações aditivas first; conexões/tokens preservados cifrados. Se incidente, revogar/reautorizar. Detalhes em `16-MIGRATION-RECOVERY.md`.
## Pendências externas
Domínio, provedor de hosting, banco, conta OIDC, cadastro de app no Bling e secretos. Ausência é bloqueio para **deploy validado**, não para testes automatizados com mocks.

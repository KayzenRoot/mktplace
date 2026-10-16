import Link from 'next/link';
import { ArrowLeft, Bot, CircleAlert, CircleCheck, Cloud, KeyRound, LockKeyhole, PlugZap, RefreshCw, ShieldCheck, Store, WandSparkles } from 'lucide-react';
import { AppShell } from '../../../src/components/AppShell';
import { requirePreviewMode } from '../../../src/lib/demo-guard';

export const dynamic = 'force-dynamic';

export default function IntegrationsPage() {
  requirePreviewMode();
  return (
    <AppShell active="integrations" title="Integrações" eyebrow="Configurações do sistema">
      <Link href="/" className="back-link"><ArrowLeft size={16}/> Voltar ao dashboard</Link>
      <section className="settings-head">
        <div><span className="kicker">CENTRAL DE CONFIGURAÇÕES</span><h1>Conecte tudo. Controle daqui.</h1><p>Suas integrações estarão reunidas nesta tela. O cadastro de credenciais será liberado apenas depois da implementação do cofre seguro.</p></div>
        <span className="settings-lock"><LockKeyhole size={28}/></span>
      </section>
      <div className="settings-notice"><CircleAlert size={20}/><span><b>Prévia visual sem acesso à produção.</b> Os botões de conexão permanecem desabilitados até a autenticação e a API serem testadas.</span></div>
      <div className="setting-section-heading"><h2>ERP principal</h2><small>Fonte oficial da operação</small></div>
      <article className="integration-card featured">
        <div className="integration-main"><span className="integration-logo bling"><Cloud size={29}/></span><div><div className="integration-title"><h3>Bling ERP</h3><span className="status-chip warning">Não conectado</span></div><p>Produtos, estoque, anúncios, pedidos, notas fiscais e financeiro via API v3.</p></div></div>
        <div className="integration-detail"><span><ShieldCheck size={17}/> OAuth 2.0 seguro</span><span><RefreshCw size={17}/> Sincronização planejada</span><span><KeyRound size={17}/> Tokens protegidos</span></div>
        <div className="integration-action"><span>O processo de conexão será liberado na WO-BLG-001 após os testes.</span><button type="button" disabled title="OAuth ainda não implementado">Conectar Bling</button></div>
      </article>
      <div className="setting-section-heading"><h2>Fornecedor</h2><small>Disponibilidade externa, separada do estoque próprio</small></div>
      <article className="integration-card">
        <div className="integration-main"><span className="integration-logo supplier"><Store size={26}/></span><div><div className="integration-title"><h3>BeHot</h3><span className="status-chip">Planejado</span></div><p>Monitoramento autorizado do catálogo, variações e disponibilidade para vendas sob demanda.</p></div></div>
        <div className="integration-action"><span>Usuário e senha serão configurados em um cofre privado, nunca no GitHub.</span><button type="button" disabled title="Cofre ainda não implementado">Configurar fornecedor</button></div>
      </article>
      <div className="setting-section-heading"><h2>Inteligência artificial</h2><small>Provedores opcionais para conteúdo e imagens</small></div>
      <div className="setting-pair">
        <article className="integration-card compact"><div className="integration-main"><span className="integration-logo ai"><Bot size={24}/></span><div><div className="integration-title"><h3>IA de textos</h3><span className="status-chip">Planejado</span></div><p>DeepSeek ou OpenAI. Títulos e descrições baseados em fatos verificados.</p></div></div><div className="tagline">API key protegida · Aprovação antes de publicar</div></article>
        <article className="integration-card compact"><div className="integration-main"><span className="integration-logo image"><WandSparkles size={24}/></span><div><div className="integration-title"><h3>IA de imagens</h3><span className="status-chip">Planejado</span></div><p>Fundo, iluminação e qualidade com revisão de fidelidade do produto.</p></div></div><div className="tagline">Processamento gratuito/local quando possível</div></article>
      </div>
      <div className="security-note"><CircleCheck size={18}/><span>Segredos não aparecem no navegador nem ficam armazenados no repositório público.</span><PlugZap size={18}/></div>
    </AppShell>
  );
}

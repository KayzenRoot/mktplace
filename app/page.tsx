import Link from 'next/link';
import { ArrowRight, Bell, CircleDot, Clock3, Layers3, Package, ShoppingBag, Sparkles, TrendingUp, WalletCards } from 'lucide-react';
import { AppShell } from '../src/components/AppShell';
import { requirePreviewMode } from '../src/lib/demo-guard';

export const dynamic = 'force-dynamic';

const cards = [
  { label: 'Vendas no período', metric: 'R$ —', supporting: 'Aguardando conexão', icon: TrendingUp, tag: 'Bling' },
  { label: 'Pedidos recebidos', metric: '—', supporting: 'Sem dados sincronizados', icon: ShoppingBag, tag: 'Canais' },
  { label: 'Anúncios publicados', metric: '—', supporting: 'Lojas não conectadas', icon: Package, tag: 'Marketplaces' },
  { label: 'Financeiro', metric: 'R$ —', supporting: 'Integração necessária', icon: WalletCards, tag: 'Bling' },
];
const channels = [
  { name: 'Mercado Livre', badge: 'ML', className: 'ml' },
  { name: 'Shopee', badge: 'S', className: 'shopee' },
  { name: 'Amazon', badge: 'a', className: 'amazon' },
];

export default function DashboardPage() {
  requirePreviewMode();
  return (
    <AppShell active="dashboard" title="Visão geral">
      <section className="welcome-banner">
        <div className="welcome-glow"/>
        <div className="welcome-text">
          <span className="welcome-eyebrow"><Sparkles size={15}/> SUA OPERAÇÃO EM UM SÓ LUGAR</span>
          <h1>Seu comércio,<br/><em>sob seu controle.</em></h1>
          <p>Gerencie seu catálogo, vendas e canais conectando sua conta Bling. Vamos construir um passo de cada vez.</p>
          <Link className="primary-action" href="/settings/integrations">Preparar integração <ArrowRight size={17}/></Link>
        </div>
        <div className="welcome-art" aria-hidden="true"><span className="orbit one"/><span className="orbit two"/><span className="art-center"><Layers3 size={56} strokeWidth={1.2}/></span><span className="orb orb-a"/><span className="orb orb-b"/><span className="orb orb-c"/></div>
      </section>
      <section className="section-heading"><div><span className="kicker">PAINEL GERAL</span><h2>Resumo da operação</h2></div><span className="subtle-label"><Clock3 size={14}/> Dados reais indisponíveis</span></section>
      <div className="stat-grid">{cards.map(({label,metric,supporting,icon: Icon,tag})=>(
        <article className="stat-card" key={label}>
          <div className="stat-top"><span className="stat-icon"><Icon size={19}/></span><small>{tag}</small></div>
          <div className="stat-label">{label}</div>
          <strong className="stat-value">{metric}</strong>
          <div className="stat-foot"><CircleDot size={13}/>{supporting}</div>
        </article>
      ))}</div>
      <div className="section-grid">
        <section className="panel main-panel">
          <div className="panel-header"><div><span className="kicker">PRIMEIROS PASSOS</span><h2>Preparar sua central</h2></div><span className="outline-tag">0 de 3</span></div>
          <div className="setup-list">
            <div className="setup-row"><span className="setup-number">01</span><span><b>Conectar sua conta Bling</b><small>Autorização OAuth e proteção dos seus dados.</small></span><span className="pending-tag">Pendente</span></div>
            <div className="setup-row"><span className="setup-number">02</span><span><b>Sincronizar o catálogo</b><small>Produtos, variações e códigos organizados.</small></span><span className="pending-tag">Futuro</span></div>
            <div className="setup-row"><span className="setup-number">03</span><span><b>Vincular os marketplaces</b><small>Mercado Livre, Shopee e Amazon pelo Bling.</small></span><span className="pending-tag">Futuro</span></div>
          </div>
          <Link href="/settings/integrations" className="text-action">Ver central de integrações <ArrowRight size={15}/></Link>
        </section>
        <section className="panel side-panel">
          <div className="panel-header"><div><span className="kicker">MONITORAMENTO</span><h2>Canais de venda</h2></div><Bell size={18} className="muted-icon"/></div>
          <p className="panel-description">Após conectar o Bling, acompanhe aqui a situação de cada loja.</p>
          <div className="channel-list">{channels.map(channel=><div className="channel-row" key={channel.name}>
            <span className={'channel-logo ' + channel.className}>{channel.badge}</span><b>{channel.name}</b><span className="channel-status">Não conectado</span>
          </div>)}</div>
          <div className="empty-footer">Nenhuma publicação será feita durante esta demonstração.</div>
        </section>
      </div>
    </AppShell>
  );
}

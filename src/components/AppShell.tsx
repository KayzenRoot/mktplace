import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  Activity, Boxes, ChartNoAxesCombined, CircleHelp, ClipboardList,
  CreditCard, FileText, House, Image, LayoutGrid, LockKeyhole,
  PackageCheck, Settings2, ShieldCheck, Store, Truck, WandSparkles,
  WalletCards, Zap, type LucideIcon,
} from 'lucide-react';

type NavEntry = { name: string; href?: string; icon: LucideIcon; id: string };
const operation: NavEntry[] = [
  { id: 'dashboard', name: 'Visão geral', href: '/', icon: House },
  { id: 'catalog', name: 'Produtos e catálogo', icon: Boxes },
  { id: 'suppliers', name: 'Fornecedores', icon: Store },
  { id: 'listings', name: 'Anúncios e canais', icon: LayoutGrid },
  { id: 'orders', name: 'Pedidos', icon: ClipboardList },
];
const management: NavEntry[] = [
  { id: 'ai', name: 'Estúdio IA', icon: WandSparkles },
  { id: 'media', name: 'Imagens', icon: Image },
  { id: 'stock', name: 'Estoque sob demanda', icon: PackageCheck },
  { id: 'shipping', name: 'Logística', icon: Truck },
  { id: 'fiscal', name: 'Notas fiscais', icon: FileText },
  { id: 'finances', name: 'Financeiro', icon: WalletCards },
  { id: 'analytics', name: 'Relatórios', icon: ChartNoAxesCombined },
];
const system: NavEntry[] = [
  { id: 'integrations', name: 'Integrações', href: '/settings/integrations', icon: Settings2 },
  { id: 'security', name: 'Segurança e auditoria', icon: LockKeyhole },
];
function NavigationGroup({ label, entries, active }: { label: string; entries: NavEntry[]; active: string }) {
  return (
    <div className="nav-group">
      <div className="nav-label">{label}</div>
      {entries.map(({ name, href, icon: Icon, id }) => href
        ? <Link key={id} href={href} className={'nav-link' + (active === id ? ' active' : '')} aria-current={active === id ? 'page' : undefined}>
            <Icon size={17} strokeWidth={1.9} aria-hidden="true"/><span>{name}</span>
          </Link>
        : <span key={id} className="nav-link disabled" title="Disponível em um próximo incremento" aria-disabled="true">
            <Icon size={17} strokeWidth={1.9} aria-hidden="true"/><span>{name}</span><i className="soon-dot"/>
          </span>)}
    </div>
  );
}

export function AppShell({ children, active, title, eyebrow = 'Central de operações' }:
  { children: ReactNode; active: 'dashboard' | 'integrations'; title: string; eyebrow?: string }) {
  return (
    <div className="app-frame">
      <aside className="sidebar" aria-label="Navegação principal">
        <Link className="brand" href="/" aria-label="MKTPlace: início">
          <span className="brand-icon"><Zap size={22} fill="currentColor" strokeWidth={1.3}/></span>
          <span className="brand-copy"><b>MKTPlace</b><small>Commerce OS</small></span>
        </Link>
        <div className="sidebar-scroll">
          <NavigationGroup label="OPERAÇÃO" entries={operation} active={active}/>
          <NavigationGroup label="INTELIGÊNCIA & GESTÃO" entries={management} active={active}/>
          <NavigationGroup label="SISTEMA" entries={system} active={active}/>
        </div>
        <div className="sidebar-foot">
          <div className="sidebar-help"><CircleHelp size={18}/><span><b>Ambiente de demonstração</b><small>Sem acesso a dados reais</small></span></div>
          <div className="sidebar-version"><ShieldCheck size={14}/> WO-BLG-001 · M00/M17</div>
        </div>
      </aside>
      <div className="main-column">
        <header className="topbar">
          <div className="top-title"><span className="eyebrow">{eyebrow}</span><strong>{title}</strong></div>
          <div className="top-actions">
            <span className="demo-pill"><span className="dot"/> MODO DEMO</span>
            <span className="top-avatar" title="Protótipo, autenticação pendente">MP</span>
          </div>
        </header>
        <main id="main-content" className="content">
          <div className="mobile-alert"><Activity size={15}/> Prévia visual. Integrações ainda não habilitadas.</div>
          {children}
        </main>
      </div>
    </div>
  );
}

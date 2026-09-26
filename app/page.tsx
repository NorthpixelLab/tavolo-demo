'use client';

import { useEffect, useMemo, useState } from 'react';
import './customer.css';
import './onboarding.css';
import { BrandLogo } from './brand';
import './polish.css';

type View = 'intro' | 'customer' | 'manager' | 'status';
type ManagerTab = 'dashboard' | 'orders' | 'tables' | 'menu' | 'analytics';
type Product = { id: number; category: string; name: string; description: string; price: number; art: string; tone: string; tag: string; available: boolean; options?: { name: string; delta: number }[] };
type CartLine = { product: Product; quantity: number; option?: { name: string; delta: number } };
type DemoOrder = { id: number; number: number; status: 'PAID' | 'IN_PREPARATION' | 'DELIVERED'; createdAt: number; lines: CartLine[]; total: number };

const initialProducts: Product[] = [
  { id: 1, category: 'Signature Cocktails', name: 'Negroni Sbagliato', description: 'Bitter, vermouth rosso e bollicine', price: 1200, art: '🍹', tone: 'coral', tag: 'Solfiti', available: true, options: [{ name: 'Classico', delta: 0 }, { name: 'Vermouth Riserva', delta: 200 }] },
  { id: 2, category: 'Signature Cocktails', name: 'Mare Alto', description: 'Gin, bergamotto, basilico e soda marina', price: 1400, art: '🌊', tone: 'lime', tag: 'Signature', available: true },
  { id: 3, category: 'Vini & Bollicine', name: 'Franciacorta Brut', description: 'Fresco, fine e persistente', price: 900, art: '🥂', tone: 'sand', tag: 'Solfiti', available: true },
  { id: 4, category: 'Vini & Bollicine', name: 'Orange Wine', description: 'Macerato artigianale dai sentori agrumati', price: 850, art: '🍷', tone: 'orange', tag: 'Naturale', available: true },
  { id: 5, category: 'Bistrot & Finger Food', name: 'Mini Bun Mediterraneo', description: 'Manzo, cipolla caramellata e mayo al limone', price: 1100, art: '🍔', tone: 'gold', tag: 'Glutine · Latte', available: true },
  { id: 6, category: 'Bistrot & Finger Food', name: 'Hummus della Casa', description: 'Ceci, tahina, paprika e pane croccante', price: 800, art: '🫓', tone: 'sage', tag: 'Sesamo', available: true },
];

const euro = (cents: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(cents / 100);

export default function Home() {
  const [tourStep, setTourStep] = useState<number | null>(0);
  const [view, setView] = useState<View>('intro');
  const [products, setProducts] = useState(initialProducts);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [orders, setOrders] = useState<DemoOrder[]>([]);
  const [managerTab, setManagerTab] = useState<ManagerTab>('dashboard');
  const [assistance, setAssistance] = useState<{ id: number; reason: string; resolved: boolean }[]>([]);
  const [staffOpen, setStaffOpen] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const [selectedOption, setSelectedOption] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [lastOrder, setLastOrder] = useState<DemoOrder | null>(null);
  const [toast, setToast] = useState('');

  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  const cartTotal = cart.reduce((sum, line) => sum + (line.product.price + (line.option?.delta ?? 0)) * line.quantity, 0);
  const liveOrders = orders.filter((order) => order.status !== 'DELIVERED');

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function navigate(next: View) {
    setView(next);
    setCartOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function addProduct(product: Product, optionIndex?: number) {
    if (!product.available) return;
    const option = optionIndex === undefined ? undefined : product.options?.[optionIndex];
    setCart((current) => {
      const index = current.findIndex((line) => line.product.id === product.id && line.option?.name === option?.name);
      if (index < 0) return [...current, { product, option, quantity: 1 }];
      return current.map((line, position) => position === index ? { ...line, quantity: line.quantity + 1 } : line);
    });
    setSelected(null);
    setToast(`${product.name} aggiunto`);
  }

  function changeCartLine(index: number, delta: number) {
    setCart((current) => current.map((line, position) => position === index ? { ...line, quantity: line.quantity + delta } : line).filter((line) => line.quantity > 0));
  }

  function productQuantity(productId: number) {
    return cart.filter((line) => line.product.id === productId).reduce((sum, line) => sum + line.quantity, 0);
  }

  function increaseProduct(product: Product) {
    const existing = cart.findIndex((line) => line.product.id === product.id);
    if (existing >= 0) changeCartLine(existing, 1);
    else if (product.options) { setSelected(product); setSelectedOption(0); }
    else addProduct(product);
  }

  function decreaseProduct(productId: number) {
    const index = cart.findLastIndex((line) => line.product.id === productId);
    if (index >= 0) changeCartLine(index, -1);
  }

  function pay() {
    const order: DemoOrder = { id: 1000 + orders.length, number: 25 + orders.length, status: 'PAID', createdAt: 0, lines: cart, total: cartTotal };
    setOrders((current) => [order, ...current]);
    setLastOrder(order);
    setCart([]);
    setCartOpen(false);
    setCheckout(false);
    navigate('status');
  }

  function advance(orderId: number) {
    setOrders((current) => current.map((order) => order.id === orderId ? { ...order, status: order.status === 'PAID' ? 'IN_PREPARATION' : 'DELIVERED' } : order));
    setLastOrder((order) => order?.id === orderId ? { ...order, status: order.status === 'PAID' ? 'IN_PREPARATION' : 'DELIVERED' } : order);
    setToast('Stato aggiornato in tempo reale');
  }

  function reset() {
    setProducts(initialProducts); setManagerTab('dashboard'); setAssistance([]); setStaffOpen(false);
    setCart([]); setOrders([]); setSelected(null); setCartOpen(false); setCheckout(false); setLastOrder(null); setToast('Demo ripristinata');
    setTourStep(0);
    navigate('intro');
  }

  function simulateNight() {
    const now = Date.now();
    const make = (id:number, number:number, status:DemoOrder['status'], minutes:number, lines:CartLine[]):DemoOrder => ({ id, number, status, createdAt:now-minutes*60000, lines, total:lines.reduce((sum,line)=>sum+line.product.price*line.quantity,0) });
    setOrders([
      make(901,190,'IN_PREPARATION',14,[{product:initialProducts[0],quantity:2},{product:initialProducts[4],quantity:1}]),
      make(902,191,'PAID',3,[{product:initialProducts[1],quantity:1}]),
      make(903,192,'IN_PREPARATION',7,[{product:initialProducts[2],quantity:2},{product:initialProducts[5],quantity:1}]),
    ]);
    setAssistance([{id:801,reason:'Posate / tovaglioli',resolved:false}]);
    setManagerTab('dashboard'); setToast('Serata simulata: ordini e sala sono live'); navigate('manager');
  }

  if (tourStep !== null) return <OnboardingTour step={tourStep} onStep={setTourStep} onComplete={() => setTourStep(null)} />;

  return <main className={view === 'manager' ? 'app manager-bg' : 'app'}>
    <header className="nav-shell">
      <button className="brand" onClick={() => navigate('intro')} aria-label="TablePop, torna all'inizio"><BrandLogo /></button>
      <div className="view-switch" aria-label="Cambia vista"><button className={view === 'customer' || view === 'status' ? 'active' : ''} onClick={() => navigate('customer')}>Cliente</button><button className={view === 'manager' ? 'active' : ''} onClick={() => navigate('manager')}>Gestore</button></div>
      <button className="reset" onClick={reset}>↻ Reset</button>
    </header>
    <div className="demo-note">Demo interattiva · nessun ordine o pagamento reale</div>
    {view === 'intro' && <Intro onCustomer={() => navigate('customer')} onManager={() => navigate('manager')} onSimulate={simulateNight} />}
    {view === 'customer' && <Customer products={products} getQuantity={productQuantity} onIncrease={increaseProduct} onDecrease={decreaseProduct} onStaff={() => setStaffOpen(true)} />}
    {view === 'status' && lastOrder && <Status order={orders.find((order) => order.id === lastOrder.id) ?? lastOrder} onAgain={() => navigate('customer')} onRepeat={() => { setCart(lastOrder.lines.map((line) => ({ ...line }))); navigate('customer'); }} onManager={() => navigate('manager')} />}
    {view === 'manager' && <ManagerShell tab={managerTab} setTab={setManagerTab} products={products} orders={liveOrders} assistance={assistance} setAssistance={setAssistance} setProducts={setProducts} onAdvance={advance} onCustomer={() => navigate('customer')} onSimulate={simulateNight} />}
    {view === 'customer' && cartCount > 0 && <button className="cart-bar" onClick={() => { setCheckout(false); setCartOpen(true); }} aria-label={`${cartCount} articoli, totale ${euro(cartTotal)}. Vedi ordine`}><span><i>{cartCount}</i><span><small>{cartCount === 1 ? '1 articolo' : `${cartCount} articoli`}</small>Vedi ordine</span></span><b>{euro(cartTotal)} →</b></button>}
    {selected && <div className="overlay" onClick={() => setSelected(null)}><section className="bottom-sheet" onClick={(event) => event.stopPropagation()}><button className="close" onClick={() => setSelected(null)}>×</button><p className="label">PERSONALIZZA</p><h2>{selected.name}</h2><p className="muted">Scegli il vermouth</p>{selected.options?.map((option, index) => <label className="option" key={option.name}><span>{option.name}</span><span>{option.delta ? `+ ${euro(option.delta)}` : 'Incluso'} <input type="radio" checked={selectedOption === index} onChange={() => setSelectedOption(index)} /></span></label>)}<button className="primary" onClick={() => addProduct(selected, selectedOption)}>Aggiungi · {euro(selected.price + (selected.options?.[selectedOption]?.delta ?? 0))}</button></section></div>}
    {cartOpen && <div className="overlay" onClick={() => setCartOpen(false)}><section className="bottom-sheet" role="dialog" aria-modal="true" aria-labelledby="cart-title" onClick={(event) => event.stopPropagation()}><button className="close" onClick={() => setCartOpen(false)} aria-label="Chiudi">×</button><p className="label">TAVOLO 14</p><h2 id="cart-title">{checkout ? 'Pagamento' : 'Il tuo ordine'}</h2>{!checkout ? <><div className="cart-lines">{cart.map((line, index) => <div className="cart-line" key={`${line.product.id}-${line.option?.name}`}><div className="line-copy"><b>{line.product.name}</b><small>{line.option?.name}</small><strong>{euro((line.product.price + (line.option?.delta ?? 0)) * line.quantity)}</strong></div><QuantityControl quantity={line.quantity} name={line.product.name} onDecrease={() => changeCartLine(index, -1)} onIncrease={() => changeCartLine(index, 1)} /></div>)}</div><div className="totals"><span>Subtotale <b>{euro(cartTotal)}</b></span><span className="total">Totale <b>{euro(cartTotal)}</b></span></div><button className="primary" onClick={() => setCheckout(true)}>Vai al pagamento · {euro(cartTotal)}</button></> : <Checkout total={cartTotal} onPay={pay} />}</section></div>}
    {staffOpen && <div className="overlay" onClick={() => setStaffOpen(false)}><section className="bottom-sheet" onClick={(event) => event.stopPropagation()}><button className="close" onClick={() => setStaffOpen(false)}>×</button><p className="label">TAVOLO 14</p><h2>Chiama lo staff</h2><p className="muted">La richiesta apparirà subito nella vista operativa.</p><div className="reason-list">{['Acqua','Posate / tovaglioli','Problema con l’ordine','Ho bisogno di assistenza'].map(reason=><button key={reason} onClick={()=>{setAssistance(current=>[{id:Date.now(),reason,resolved:false},...current]);setStaffOpen(false);setToast('Richiesta inviata allo staff')}}>{reason}<span>→</span></button>)}</div></section></div>}
    {toast && <div className="toast" role="status">{toast}</div>}
  </main>;
}

const tourContent = [
  {
    eyebrow: 'PIÙ SECONDI GIRI',
    title: 'Il tavolo ordina.\nTu non perdi il momento.',
    copy: 'Dal QR al pagamento in pochi tap: il cliente riordina quando ne ha voglia, anche durante il pienone.',
    visual: 'order',
  },
  {
    eyebrow: 'MENO CAOS AL BAR',
    title: 'La comanda arriva\ngià chiara e pagata.',
    copy: 'Tavolo, quantità e modifiche compaiono subito nel flusso operativo. Lo staff prepara, non rincorre informazioni.',
    visual: 'kds',
  },
  {
    eyebrow: 'CONTROLLO LIVE',
    title: 'La serata scorre.\nTu vedi tutto.',
    copy: 'Ordini, tavoli e disponibilità restano sincronizzati: più controllo nei picchi, senza togliere umanità al servizio.',
    visual: 'control',
  },
] as const;

function OnboardingTour({ step, onStep, onComplete }: { step: number; onStep: (step: number) => void; onComplete: () => void }) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const content = tourContent[step];
  const next = () => step === tourContent.length - 1 ? onComplete() : onStep(step + 1);
  const previous = () => step > 0 && onStep(step - 1);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' || event.key === 'Enter') next();
      if (event.key === 'ArrowLeft') previous();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  return <main className={`onboarding onboarding-${content.visual}`} onTouchStart={(event) => setTouchStart(event.touches[0].clientX)} onTouchEnd={(event) => { if (touchStart === null) return; const distance = event.changedTouches[0].clientX - touchStart; if (distance < -55) next(); if (distance > 55) previous(); setTouchStart(null); }}>
    <header className="onboarding-top"><div className="onboarding-brand"><BrandLogo /></div><span>Demo per il gestore</span></header>
    <section className="onboarding-stage" aria-live="polite">
      <TourVisual type={content.visual} />
      <div className="onboarding-copy"><p>{content.eyebrow}</p><h1>{content.title.split('\n').map((line) => <span key={line}>{line}</span>)}</h1><div className="onboarding-caption">{content.copy}</div></div>
    </section>
    <footer className="onboarding-footer">
      <div className="tour-progress" aria-label={`Passaggio ${step + 1} di ${tourContent.length}`}>{tourContent.map((_, index) => <button key={index} className={index === step ? 'active' : ''} onClick={() => onStep(index)} aria-label={`Vai al passaggio ${index + 1}`} aria-current={index === step ? 'step' : undefined} />)}</div>
      <div className="tour-actions">{step > 0 && <button className="tour-back" onClick={previous}>Indietro</button>}<button className="tour-next" onClick={next}>{step === tourContent.length - 1 ? 'Inizia la demo' : 'Continua'} <span>→</span></button></div>
    </footer>
  </main>;
}

function TourVisual({ type }: { type: typeof tourContent[number]['visual'] }) {
  if (type === 'order') return <div className="tour-visual order-visual" aria-label="Un cliente aggiunge un secondo giro dal tavolo"><div className="tour-phone"><header><b><BrandLogo /></b><i>Tavolo 14</i></header><p>IL PROSSIMO GIRO</p><h2>Cosa ti va?</h2><div className="mini-product coral"><em>🍹</em><div><b>Negroni Sbagliato</b><small>Bitter, vermouth, bollicine</small></div><strong>12 €</strong></div><div className="mini-product lime"><em>🌊</em><div><b>Mare Alto</b><small>Gin, bergamotto, basilico</small></div><div className="mini-stepper"><i>−</i><b>2</b><i>+</i></div></div><button>2 articoli · 28 € <span>Ordina →</span></button></div><div className="tour-badge"><b>+1 giro</b><span>senza attese</span></div></div>;
  if (type === 'kds') return <div className="tour-visual kds-visual" aria-label="La comanda pagata arriva al bar"><div className="flow-source"><span>T14</span><div><b>Ordine inviato</b><small>Pagamento confermato</small></div><i>✓</i></div><div className="flow-line"><i/><span>LIVE</span></div><article className="tour-ticket"><header><span>ORDINE #25</span><b>ADESSO</b></header><h2>Tavolo 14</h2><div><b>2× Negroni Sbagliato</b><small>+ Vermouth Riserva</small></div><div><b>1× Hummus della Casa</b></div><button>♨ Inizia preparazione</button></article></div>;
  return <div className="tour-visual control-visual" aria-label="Dashboard live con ordini, tavoli e disponibilità"><div className="control-shell"><header><div><p>GIOVEDÌ · APERICENA</p><h2>Buon servizio.</h2></div><span>● LIVE</span></header><div className="control-metrics"><article><small>Incasso oggi</small><b>3.260 €</b><i>↗ 14%</i></article><article><small>Ordini</small><b>177</b><i>73% QR</i></article></div><div className="control-bottom"><article><small>SALA</small><b>18 / 24 tavoli</b><div>{[4,8,12,14,18].map((table) => <i key={table} className={table === 14 ? 'attention' : ''}>T{table}</i>)}</div></article><article className="availability"><small>DISPONIBILITÀ</small><span>Negroni <b>ON</b></span><span>Mare Alto <b>ON</b></span></article></div></div></div>;
}

function Intro({ onCustomer, onManager, onSimulate }: { onCustomer: () => void; onManager: () => void; onSimulate: () => void }) {
  return <section className="intro"><div className="intro-copy"><p className="label lime">TABLEPOP · IL SISTEMA OPERATIVO DELLA SERATA</p><h1>Ordina.<br/>Aiuta lo staff.</h1><p>Scopri in tre minuti come TablePop collega cliente, sala, bar e cucina: meno attese, meno caos, più controllo.</p><div className="intro-actions"><button className="primary lime-button" onClick={onCustomer}>Inizia come cliente →</button><button className="secondary" onClick={onManager}>Esplora il gestionale</button><button className="ghost-action" onClick={onSimulate}>▶ Simula una serata</button></div><small>Consiglio: ordina dal telefono, paga e poi guarda la comanda arrivare allo staff.</small></div><div className="phone-stage"><div className="glow"/><div className="phone"><div className="phone-top"><span>TablePop</span><i>Tavolo 14</i></div><div className="phone-hero"><small>Lume · Cocktail & Aperitivo</small><h3>Il prossimo giro<br/>è già qui.</h3></div><div className="phone-item"><span>🍹</span><div><b>Negroni Sbagliato</b><small>Vermouth Riserva</small></div><b>€14</b></div><button>Ordina e paga</button></div><div className="qr">▦<small>SCAN ME</small></div></div></section>;
}

function Customer({ products, getQuantity, onIncrease, onDecrease, onStaff }: { products: Product[]; getQuantity: (id: number) => number; onIncrease: (product: Product) => void; onDecrease: (id: number) => void; onStaff: () => void }) {
  const [active, setActive] = useState('Tutto');
  const categoryMap: Record<string, string> = { Cocktail: 'Signature Cocktails', Vini: 'Vini & Bollicine', 'Finger food': 'Bistrot & Finger Food' };
  const categoryNames = [...new Set(products.map((product) => product.category))];
  const visibleCategories = active === 'Tutto' || active === 'Senza glutine' ? categoryNames : categoryNames.filter((category) => category === categoryMap[active]);
  const visibleProducts = (category: string) => products.filter((product) => product.category === category && (active !== 'Senza glutine' || !product.tag.toLowerCase().includes('glutine')));
  return <><header className="customer-hero"><div className="customer-inner"><div className="venue"><span>Lume · Cocktail & Aperitivo</span><b>Tavolo 14</b></div><div className="hero-row"><div><p className="label lime">APERTO · CUCINA FINO ALLE 23:00</p><h1>Cosa ti va<br/>di ordinare?</h1><p>Ordina qui, senza aspettare.</p></div><button className="staff-call" onClick={onStaff}>✋ Chiama staff</button></div></div></header><nav className="chips" aria-label="Categorie menu">{['Tutto','Cocktail','Vini','Finger food','Senza glutine'].map((label) => <button key={label} className={active === label ? 'selected' : ''} aria-pressed={active === label} onClick={() => setActive(label)}>{label === 'Senza glutine' ? '◎ ' : ''}{label}</button>)}</nav><div className="menu-wrap">{visibleCategories.map((category) => { const categoryProducts = visibleProducts(category); return categoryProducts.length ? <section key={category}><div className="section-head"><h2>{category}</h2><span>{categoryProducts.length} SCELTE</span></div><div className="menu-grid">{categoryProducts.map((product) => { const quantity = getQuantity(product.id); return <article className={`menu-card ${product.available ? '' : 'unavailable'}`} key={product.id}><div className={`food-art ${product.tone}`} aria-hidden="true"><span>{product.art}</span>{!product.available && <em>TERMINATO</em>}</div><div className="card-copy"><div><h3>{product.name}</h3><b>{euro(product.price)}</b></div><p>{product.description}</p><footer><small>{product.tag}</small>{product.available && <QuantityControl quantity={quantity} name={product.name} onDecrease={() => onDecrease(product.id)} onIncrease={() => onIncrease(product)} />}</footer></div></article>; })}</div></section> : null; })}</div></>;
}

function QuantityControl({ quantity, name, onDecrease, onIncrease }: { quantity: number; name: string; onDecrease: () => void; onIncrease: () => void }) {
  if (quantity === 0) return <button className="quantity-add" onClick={onIncrease} aria-label={`Aggiungi ${name}`}>+</button>;
  return <div className="quantity-control" aria-label={`${quantity} ${name} nel carrello`}><button onClick={onDecrease} aria-label={`Rimuovi un ${name}`}>−</button><b aria-live="polite">{quantity}</b><button onClick={onIncrease} aria-label={`Aggiungi un altro ${name}`}>+</button></div>;
}

function Checkout({ total, onPay }: { total: number; onPay: () => void }) {
  const [cardOpen, setCardOpen] = useState(false);
  return <div className="checkout"><div className="checkout-total"><span>Totale</span><b>{euro(total)}</b></div><p className="demo-payment">Simulazione: non inserire dati reali.</p><button className="wallet apple" onClick={onPay}>● Apple Pay</button><button className="wallet google" onClick={onPay}>G Pay · Google Pay</button><div className="divider"><span/>oppure<span/></div><button className="card-toggle" aria-expanded={cardOpen} onClick={() => setCardOpen((open) => !open)}>Paga con carta <span>{cardOpen ? '−' : '+'}</span></button>{cardOpen && <div className="card-fields"><div className="fake-field">4242 4242 4242 4242</div><div className="field-grid"><div className="fake-field">12 / 30</div><div className="fake-field">123</div></div><button className="primary" onClick={onPay}>Simula pagamento · {euro(total)}</button></div>}</div>;
}

function Status({ order, onAgain, onRepeat, onManager }: { order: DemoOrder; onAgain: () => void; onRepeat: () => void; onManager: () => void }) {
  const rank = order.status === 'PAID' ? 0 : order.status === 'IN_PREPARATION' ? 1 : 2;
  const steps = [['✓', 'Ordine ricevuto', 'Pagamento demo completato'], ['♨', 'In preparazione', 'Il bar prepara il tuo ordine'], ['⌂', 'Consegnato', 'Buon appetito!']];
  return <section className="status-page"><div className="status-card"><div className="big-check">✓</div><p className="label lime">PAGAMENTO CONFERMATO</p><h1>Ci pensiamo noi.</h1><p className="muted">Ordine #{order.number} · Tavolo 14 · {euro(order.total)}</p><div className="timeline" aria-live="polite">{steps.map((step, index) => <div className={`step ${index <= rank ? 'on' : ''}`} key={step[1]}><i>{step[0]}</i><div><b>{step[1]}</b><small>{step[2]}</small></div></div>)}</div><button className="primary order-again" onClick={onAgain}>↻ Ordina ancora</button><button className="repeat-order" onClick={onRepeat}>Ripeti ordine · {euro(order.total)}</button><button className="secondary dark" onClick={onManager}>Guarda la comanda nel KDS →</button><small className="fiscal">Documento non fiscale. Esperienza dimostrativa.</small></div></section>;
}

function OperationalBoard({ products, orders, setProducts, onAdvance, onCustomer }: { products: Product[]; orders: DemoOrder[]; setProducts: React.Dispatch<React.SetStateAction<Product[]>>; onAdvance: (id: number) => void; onCustomer: () => void }) {
  const revenue = useMemo(() => orders.reduce((sum, order) => sum + order.total, 0), [orders]);
  return <section className="manager"><div className="manager-main"><div className="manager-heading"><div><p className="label lime">LIVE KITCHEN DISPLAY</p><h1>Comande attive <span>{orders.length}</span></h1></div><div className="live">● LIVE</div></div><div className="metrics"><div><small>Incasso demo</small><b>{euro(revenue)}</b></div><div><small>Ordini attivi</small><b>{orders.length}</b></div><div><small>Tempo medio</small><b>04:12</b></div></div><div className="tickets">{orders.length ? orders.map((order) => <article className={`ticket ${order.status === 'IN_PREPARATION' ? 'preparing' : ''}`} key={order.id}><header><div><small>ORDINE #{order.number}</small><h2>Tavolo 14</h2></div><b>adesso</b></header><div className="ticket-lines">{order.lines.map((line) => <div key={`${line.product.id}-${line.option?.name}`}><b>{line.quantity}× {line.product.name}</b>{line.option && <small>+ {line.option.name}</small>}</div>)}</div><button onClick={() => onAdvance(order.id)}>{order.status === 'PAID' ? '♨ Inizia preparazione' : '✓ Segna consegnato'}</button></article>) : <div className="empty"><span>◌</span><h2>Nessuna comanda attiva</h2><p>Completa un ordine dalla vista cliente: apparirà qui.</p><button className="secondary dark" onClick={onCustomer}>Vai alla vista cliente</button></div>}</div></div><aside className="stock"><p className="label lime">86 QUICK DRAWER</p><h2>Disponibilità</h2><p>Disattiva un prodotto e torna al menu cliente.</p>{products.map((product) => <button key={product.id} onClick={() => { setProducts((current) => current.map((item) => item.id === product.id ? { ...item, available: !item.available } : item)); }}><span className={product.available ? '' : 'strike'}>{product.name}</span><b>{product.available ? 'ON' : 'OFF'}</b></button>)}</aside></section>;
}

function ManagerShell({tab,setTab,products,orders,assistance,setAssistance,setProducts,onAdvance,onCustomer,onSimulate}:{tab:ManagerTab;setTab:(tab:ManagerTab)=>void;products:Product[];orders:DemoOrder[];assistance:{id:number;reason:string;resolved:boolean}[];setAssistance:React.Dispatch<React.SetStateAction<{id:number;reason:string;resolved:boolean}[]>>;setProducts:React.Dispatch<React.SetStateAction<Product[]>>;onAdvance:(id:number)=>void;onCustomer:()=>void;onSimulate:()=>void}){
  const tabs:ManagerTab[]=['dashboard','orders','tables','menu','analytics']; const help=assistance.find(item=>!item.resolved); const revenue=324860+orders.reduce((sum,order)=>sum+order.total,0);
  return <section className="manager-shell"><aside className="side-nav"><div className="side-brand"><BrandLogo /><small>Lume · Milano</small></div>{tabs.map(item=><button className={tab===item?'active':''} onClick={()=>setTab(item)} key={item}>{({dashboard:'◫ Dashboard',orders:'▤ Ordini',tables:'⌗ Tavoli',menu:'☷ Menu',analytics:'↗ Analytics'} as Record<ManagerTab,string>)[item]}{item==='orders'&&orders.length>0?<i>{orders.length}</i>:null}</button>)}<button className="simulate" onClick={onSimulate}>▶ Simula serata</button></aside><div className="manager-area"><header className="manager-title"><div><p className="label">GIOVEDÌ · SERVIZIO APERICENA</p><h1>{({dashboard:'Buon servizio.',orders:'Ordini operativi',tables:'Mappa della sala',menu:'Menu e disponibilità',analytics:'Numeri che aiutano'} as Record<ManagerTab,string>)[tab]}</h1></div><span className="live">● LIVE</span></header>{help&&<div className="help-banner"><div><b>✋ Tavolo 14 richiede assistenza</b><span>{help.reason} · adesso</span></div><button onClick={()=>setAssistance(current=>current.map(item=>item.id===help.id?{...item,resolved:true}:item))}>Prendo io</button></div>}{tab==='dashboard'&&<ManagerDashboard revenue={revenue} orderCount={orders.length} setTab={setTab}/>} {tab==='orders'&&<OperationalBoard products={products} orders={orders} setProducts={setProducts} onAdvance={onAdvance} onCustomer={onCustomer}/>} {tab==='tables'&&<TableMap orders={orders} hasHelp={Boolean(help)}/>} {tab==='menu'&&<OperationalBoard products={products} orders={[]} setProducts={setProducts} onAdvance={onAdvance} onCustomer={onCustomer}/>} {tab==='analytics'&&<ManagerAnalytics revenue={revenue}/>}</div></section>
}

function ManagerDashboard({revenue,orderCount,setTab}:{revenue:number;orderCount:number;setTab:(tab:ManagerTab)=>void}){const total=176+orderCount;return <><div className="metrics rich"><div><small>Incasso oggi</small><b>{euro(revenue)}</b><span>↗ 14% vs giovedì scorso</span></div><div><small>Ordini</small><b>{total}</b><span>73% QR · 27% staff</span></div><div><small>Scontrino medio</small><b>{euro(Math.round(revenue/total))}</b><span>+€2,10 con upsell</span></div><div><small>Tempo medio</small><b>6m 42s</b><span>{orderCount} ordini attivi</span></div></div><div className="manager-panels"><article><p className="label">SALA</p><h2>18 / 24 tavoli occupati</h2><div className="occupancy"><i/></div><div className="mini-table-list">{[4,8,12,14,18,21].map((n,i)=><span className={i===1?'late':i===3?'help':''} key={n}>T{n}</span>)}</div><button onClick={()=>setTab('tables')}>Apri la mappa →</button></article><article className="insight"><p className="label">TABLEPOP INSIGHT</p><h2>Chi ordina uno Spritz aggiunge un Tagliere nel 34% dei casi.</h2><p>I suggerimenti hanno generato €386 questa settimana.</p><button onClick={()=>setTab('analytics')}>Scopri perché →</button></article></div></>}

function TableMap({orders,hasHelp}:{orders:DemoOrder[];hasHelp:boolean}){return <div className="table-layout"><div className="floor-map"><div className="map-legend"><span>● Libero</span><span>● Occupato</span><span>● Pronto</span><span>● Assistenza</span></div><div className="table-grid">{Array.from({length:18},(_,i)=>i+1).map(n=>{const order=orders[n%Math.max(orders.length,1)];const state=n===14&&hasHelp?'help':order&&n%3===0?'busy':n===8?'late':'free';return <button className={`table-node ${state}`} key={n}><b>T{n}</b><small>{state==='free'?'Libero':state==='help'?'Assistenza':state==='late'?'14 min':'Occupato'}</small></button>})}</div></div><aside className="session-card"><p className="label">SESSIONE ATTIVA</p><h2>Tavolo 14</h2><span>5 ospiti</span><span>3 ordini</span><span>€74,50 totale</span><span>€52 pagati</span><span>€22,50 da pagare</span><span>1h 12m permanenza</span><button>+ Nuovo ordine</button><button>Sposta / unisci</button></aside></div>}

function ManagerAnalytics({revenue}:{revenue:number}){return <div className="analytics"><article><p className="label">VENDITE OGGI</p><h2>{euro(revenue)} <span>+14%</span></h2><div className="bars">{[42,58,48,72,88,96,78,62].map((h,i)=><i style={{height:`${h}%`}} key={i}/>)}</div><small>18:00 &nbsp;&nbsp;&nbsp; picco 20:45 &nbsp;&nbsp;&nbsp; 00:00</small></article><article><p className="label">MENU INTELLIGENCE</p><h2>Tra le 20:30 e le 21:15 arriva il 31% degli ordini.</h2><p>Una postazione bar aggiuntiva può ridurre l’attesa stimata di 2 minuti.</p></article><article><p className="label">TOP PRODOTTI</p><ol><li>Spritz Mediterraneo <b>62 · €527</b></li><li>Tagliere Lume <b>41 · €594,50</b></li><li>Gin Tonic <b>33 · €396</b></li></ol></article></div>}

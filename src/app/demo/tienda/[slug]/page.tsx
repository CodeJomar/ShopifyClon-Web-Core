'use client'
// Prototipo autocontenido (sin API): estos avisos del compilador de React no aplican a su estado local.
/* eslint-disable react-hooks/set-state-in-effect, react-hooks/purity */
import * as React from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Check, Minus, Plus, ShoppingBag, ShoppingCart, Store, X } from 'lucide-react'
import { demoId, money, readDemo, saveDemo, type DemoData } from '../../demo-data'
import { ThemeToggle } from '@/shared/components/theme/theme-toggle'

export default function DemoStoreFront(){
 const params=useParams<{slug:string}>();const slug=params.slug
 const [data,setData]=React.useState<DemoData|null>(null)
 const [cart,setCart]=React.useState<Record<string,number>>({})
 const [drawer,setDrawer]=React.useState(false)
 const [buyer,setBuyer]=React.useState('')
 const [done,setDone]=React.useState(false)
 React.useEffect(()=>setData(readDemo()),[])
 if(!data)return <main className="od-loading">Abriendo tienda de ejemplo…</main>
 const store=data.shops.find(s=>s.slug===slug)
 if(!store)return <main className="od-missing"><Store size={38}/><h1>Esta tienda no existe en el prototipo</h1><Link href="/demo">Volver a la demostración</Link></main>
 const products=data.products.filter(p=>p.shop===store.id)
 const total=products.reduce((sum,p)=>sum+p.price*(cart[p.id]||0),0)
 const count=Object.values(cart).reduce((sum,n)=>sum+n,0)
 const add=(id:string)=>{const product=products.find(p=>p.id===id);if(!product)return;setCart(c=>({...c,[id]:Math.min(product.stock,(c[id]||0)+1)}));setDrawer(true);setDone(false)}
 const change=(id:string,delta:number)=>{const product=products.find(p=>p.id===id);if(!product)return;setCart(c=>({...c,[id]:Math.max(0,Math.min(product.stock,(c[id]||0)+delta))}))}
 const checkout=(e:React.FormEvent)=>{e.preventDefault();if(!buyer.trim()||count===0)return;const next={...data,orders:[{id:'OT-'+Math.floor(1000+Math.random()*9000),customer:buyer.trim(),total,status:'Pendiente',shop:store.id},...data.orders],products:data.products.map(p=>cart[p.id]?{...p,stock:Math.max(0,p.stock-cart[p.id])}:p)};saveDemo(next);setData(next);setCart({});setDrawer(false);setDone(true);setBuyer('')}
 return <main className="od-storefront"><div className="od-store-announcement">Vista de cliente · Tienda de ejemplo, sin pagos reales</div><header className="od-store-nav"><Link href={`/demo/tienda/${slug}`} className="od-store-logo"><Store size={24}/> {store.name}</Link><nav aria-label="Navegación de la tienda"><a href="#productos">Productos</a><Link href="/demo"><ArrowLeft size={15}/> Volver a demo</Link></nav><div className="od-store-actions"><ThemeToggle/><button type="button" className="od-cart-button" onClick={()=>setDrawer(true)} aria-label={`Abrir carrito, ${count} productos`}><ShoppingCart size={19}/><span>{count}</span></button></div></header>
 <section className="od-store-hero"><div><span className="od-kicker">BIENVENIDO A {store.name.toUpperCase()}</span><h1>Encuentra algo especial para cada día.</h1><p>Productos seleccionados con cuidado y una experiencia de compra simple. Este catálogo es una vista de demostración.</p><a href="#productos" className="od-primary">Explorar productos <ShoppingBag size={17}/></a></div><div className="od-store-hero-art" aria-hidden="true"><span>✦</span><span>OTemu</span></div></section>
 {done&&<div role="status" className="od-order-success"><Check size={18}/> ¡Pedido simulado registrado! Revisa la sección Pedidos del panel de demostración.</div>}
 <section id="productos" className="od-store-products"><div className="od-store-section-heading"><div><span className="od-kicker">NUESTRA SELECCIÓN</span><h2>Productos destacados</h2></div><p>{products.length} productos disponibles en esta tienda</p></div><div className="od-store-grid">{products.map(p=><article className="od-store-product" key={p.id}><div className="od-store-product-photo">{p.image?<img src={p.image} alt={p.name}/>:<span role="img" aria-label="Producto">{(/café|cafe/i.test(p.name)?'☕':/taza/i.test(p.name)?'🍵':/bolso|tote/i.test(p.name)?'👜':'📦')}</span>}</div><div className="od-store-product-info"><span className="od-kicker">{p.category}</span><h3>{p.name}</h3><div><strong>{money(p.price)}</strong><button className="od-add-cart" onClick={()=>add(p.id)} disabled={p.stock===0}>{p.stock?'Añadir al carrito':'Agotado'} <Plus size={16}/></button></div></div></article>)}{!products.length&&<p>Esta tienda todavía no tiene productos en la demostración.</p>}</div></section><footer className="od-store-footer">{store.name} · Creado con OTemu <span>Prototipo UX/UI, sin transacciones reales</span></footer>
 {drawer&&<div className="od-modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setDrawer(false)}}><section className="od-cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title"><header><h2 id="cart-title">Tu carrito ({count})</h2><button type="button" aria-label="Cerrar carrito" onClick={()=>setDrawer(false)} className="od-icon-btn"><X size={20}/></button></header><div className="od-cart-body">{count?products.filter(p=>cart[p.id]>0).map(p=><div key={p.id} className="od-cart-row"><span className="od-cart-emoji">{p.image?<img src={p.image} alt=""/>:'📦'}</span><div><strong>{p.name}</strong><p>{money(p.price)}</p><div className="od-cart-qty"><button type="button" aria-label={`Quitar una unidad de ${p.name}`} onClick={()=>change(p.id,-1)}><Minus size={14}/></button><span>{cart[p.id]}</span><button type="button" aria-label={`Agregar una unidad de ${p.name}`} onClick={()=>change(p.id,1)}><Plus size={14}/></button></div></div></div>):<p className="od-empty">Tu carrito está vacío. Explora nuestros productos.</p>}</div><div className="od-cart-bottom"><div className="od-cart-total"><span>Subtotal</span><strong>{money(total)}</strong></div><form onSubmit={checkout} className="od-form"><label>Nombre para pedido de prueba<input required value={buyer} onChange={e=>setBuyer(e.target.value)} placeholder="Nombre del cliente"/></label><button className="od-primary od-wide" type="submit" disabled={!count}>Finalizar compra de prueba</button></form><p className="od-small-muted">No se solicita tarjeta ni se procesa ningún pago.</p></div></section></div>}
 </main>
}

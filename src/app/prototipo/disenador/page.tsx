"use client"

import * as React from "react"
import Link from "next/link"
import { ThemeToggle } from "@/shared/components/theme/theme-toggle"
import { ArrowLeft, Check, Coffee, Gift, Monitor, Palette, RotateCcw, Shirt, ShoppingBag, Smartphone, Sparkles, Store } from "lucide-react"

type Estilo = "Nativa" | "Atelier" | "Pulse" | "Aurora"
const PLANTILLAS: { nombre:Estilo; color:string; fondo:string; descripcion:string }[] = [
  {nombre:"Nativa",color:"#557764",fondo:"#e8efe7",descripcion:"Natural y cercana"},
  {nombre:"Atelier",color:"#776f5f",fondo:"#f1eee6",descripcion:"Editorial y elegante"},
  {nombre:"Pulse",color:"#5e7781",fondo:"#e9eff0",descripcion:"Moderna y serena"},
  {nombre:"Aurora",color:"#806a73",fondo:"#f2ecee",descripcion:"Creativa y delicada"},
]

const PRODUCTOS = [
  {nombre:"Café de especialidad",precio:"S/ 39.00",icono:Coffee,fondo:"#e8efe7"},
  {nombre:"Camiseta orgánica",precio:"S/ 59.00",icono:Shirt,fondo:"#f0ece4"},
  {nombre:"Set para regalar",precio:"S/ 79.00",icono:Gift,fondo:"#efedf0"},
]

export default function EditorVisualDemo() {
  const [plantilla, setPlantilla] = React.useState<Estilo>("Nativa")
  const [nombre, setNombre] = React.useState("Cofee Studio")
  const [titulo, setTitulo] = React.useState("Pequeños detalles, grandes momentos.")
  const [descripcion, setDescripcion] = React.useState("Descubre objetos especiales para acompañar cada día.")
  const [acento, setAcento] = React.useState("#557764")
  const [mobile, setMobile] = React.useState(false)
  const [productosVisibles, setProductosVisibles] = React.useState(true)
  const [aviso, setAviso] = React.useState(false)
  const actual = PLANTILLAS.find((t)=>t.nombre===plantilla) ?? PLANTILLAS[0]
  const elegirPlantilla = (p:typeof PLANTILLAS[number]) => {setPlantilla(p.nombre);setAcento(p.color)}
  const restablecer=()=>{ setPlantilla("Nativa");setNombre("Cofee Studio");setTitulo("Pequeños detalles, grandes momentos.");setDescripcion("Descubre objetos especiales para acompañar cada día.");setAcento("#557764");setProductosVisibles(true);setAviso(false) }
  return (
    <main className="otemu-design-lab">
      <div className="otemu-lab-topbar">
        <div>
          <Link href="/" className="otemu-lab-control"><ArrowLeft className="size-4" /> Volver</Link>
          <span className="flex items-center gap-2 font-black"><Store className="size-5 text-brand-text" /> OTemu <span className="hidden font-semibold text-muted-foreground sm:inline">/</span> <span className="hidden text-foreground sm:inline">Diseñador visual</span></span>
          <span className="otemu-lab-pill"><Sparkles className="size-3" /> PROTOTIPO VISUAL</span>
        </div>
        <div>
          <span className="otemu-lab-subtitle hidden md:block">Los cambios solo se ven en esta demostración</span>
          <ThemeToggle />
          <button type="button" className="otemu-lab-control" onClick={restablecer}><RotateCcw className="size-4" /> Reiniciar</button>
        </div>
      </div>
      <div className="otemu-lab-stage">
        <aside className="otemu-lab-controls">
          <div>
            <span className="otemu-eyebrow"><Palette className="size-4" /> PERSONALIZA TU ESPACIO</span>
            <h1 className="otemu-lab-title mt-2">Diseña tu tienda</h1>
            <p className="otemu-lab-help mt-2">Experimenta con plantillas, colores y textos. Esta pantalla es solo una maqueta interactiva y no altera las tiendas reales.</p>
          </div>
          <div>
            <p className="mb-3 text-xs font-black">01 · Plantilla</p>
            <div className="otemu-lab-template-grid">
              {PLANTILLAS.map((p)=>(
                <button type="button" key={p.nombre} className="otemu-lab-template" aria-pressed={plantilla===p.nombre} onClick={()=>elegirPlantilla(p)}>
                  <span className="otemu-lab-template-swatch" style={{"--demo-swatch":p.fondo} as React.CSSProperties}/>
                  {p.nombre} {plantilla===p.nombre&&<Check className="ml-1 inline size-3 text-brand-text"/>}
                  <span className="mt-1 block text-[10px] font-medium text-muted-foreground">{p.descripcion}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-black">02 · Identidad</p>
            <div className="otemu-lab-field"><label htmlFor="otemu-nombre">Nombre de la tienda</label><input id="otemu-nombre" value={nombre} maxLength={46} onChange={(e)=>setNombre(e.target.value)}/></div>
            <div className="otemu-lab-field"><label htmlFor="otemu-titulo">Titular de portada</label><input id="otemu-titulo" value={titulo} maxLength={75} onChange={(e)=>setTitulo(e.target.value)}/></div>
            <div className="otemu-lab-field"><label htmlFor="otemu-descripcion">Subtítulo</label><input id="otemu-descripcion" value={descripcion} maxLength={95} onChange={(e)=>setDescripcion(e.target.value)}/></div>
          </div>
          <div>
            <p className="mb-3 text-xs font-black">03 · Color de marca</p>
            <div className="otemu-lab-colors" role="group" aria-label="Colores de marca">
              {["#078568","#5b5c51","#334db1","#a34e70","#bb6b32"].map((c)=><button key={c} type="button" aria-label={`Usar color ${c}`} aria-pressed={acento===c} className="otemu-lab-color" style={{"--demo-swatch":c} as React.CSSProperties} onClick={()=>setAcento(c)}/>)
              }
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-black">04 · Secciones</p>
            <label className="flex cursor-pointer items-center gap-3 text-xs font-semibold"><input type="checkbox" checked={productosVisibles} onChange={(e)=>setProductosVisibles(e.target.checked)} className="size-4 accent-[var(--brand-strong)]"/> Mostrar productos destacados</label>
            <label className="flex cursor-pointer items-center gap-3 text-xs font-semibold"><input type="checkbox" checked={aviso} onChange={(e)=>setAviso(e.target.checked)} className="size-4 accent-[var(--brand-strong)]"/> Mostrar anuncio superior</label>
          </div>
          <div className="rounded-xl border border-border bg-secondary px-4 py-3 text-[11px] leading-relaxed text-muted-foreground">
            <strong className="block text-brand-text">Solo presentación UX/UI</strong>
            Este prototipo no publica, guarda ni modifica datos en Spring Boot o Supabase.
          </div>
        </aside>
        <section className="otemu-lab-preview-pane" aria-label="Vista previa de la tienda">
          <div className="otemu-lab-preview-toolbar">
            <div>
              <p className="text-sm font-extrabold">Vista previa en tiempo real</p>
              <p className="otemu-lab-help">Plantilla {plantilla} · Ejemplo de escaparate</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="otemu-lab-control" aria-pressed={!mobile} onClick={()=>setMobile(false)}><Monitor className="size-4"/> <span className="hidden sm:inline">Escritorio</span></button>
              <button type="button" className="otemu-lab-control" aria-pressed={mobile} onClick={()=>setMobile(true)}><Smartphone className="size-4"/> <span className="hidden sm:inline">Móvil</span></button>
            </div>
          </div>
          <div className={`otemu-lab-device ${mobile?"mobile":""}`} style={{"--demo-accent":acento,"--demo-background":actual.fondo} as React.CSSProperties}>
            {aviso && <div className="p-2 text-center text-[10px] font-bold text-white" style={{background:acento}}>Un lugar para encontrar algo especial</div>}
            <div className="otemu-demo-store-nav"><b>{nombre || "Mi tienda"}</b><small className="flex items-center gap-2">Inicio <span>·</span> Productos <ShoppingBag className="size-4"/></small></div>
            <div className="otemu-demo-store-hero">
              <div>
                <span className="otemu-shop-kicker"><Sparkles className="size-3"/> DESCUBRE NUESTRA SELECCIÓN</span>
                <h2 className="mt-3">{titulo || "Tu tienda, a tu estilo"}</h2>
                <p>{descripcion || "Una tienda diseñada para descubrir."}</p>
                <button type="button" onClick={()=>document.getElementById("otemu-lab-products")?.scrollIntoView({behavior:"smooth",block:"center"})}>Explorar productos →</button>
              </div>
            </div>
            {productosVisibles && <section id="otemu-lab-products" className="otemu-demo-store-section" aria-labelledby="otemu-lab-products-heading">
              <h3 id="otemu-lab-products-heading">Productos destacados</h3>
              <div className="otemu-demo-product-grid">
                {PRODUCTOS.map((prod)=>{const Icono=prod.icono;return <article key={prod.nombre} className="otemu-demo-product">
                  <div className="otemu-demo-product-art" style={{"--demo-product-bg":prod.fondo} as React.CSSProperties}><Icono strokeWidth={1.15} className="size-14"/></div>
                  <div className="otemu-demo-product-info">{prod.nombre}<span>{prod.precio}</span></div>
                </article>})}
              </div>
            </section>}
            <footer className="otemu-demo-store-bottom">{nombre || "Mi tienda"} · Ejemplo de diseño creado con OTemu</footer>
          </div>
        </section>
      </div>
    </main>
  )
}

import Link from "next/link"
import type { CSSProperties } from "react"
import { ThemeToggle } from "@/shared/components/theme/theme-toggle"
import {
  ArrowRight,
  ChartNoAxesColumn,
  ChevronRight,
  LayoutTemplate,
  Package,
  Palette,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
} from "lucide-react"

const BARS = [40, 57, 47, 73, 60, 84, 68, 94]

export default function Page() {
  return (
    <main className="otemu-marketing">
      <header className="otemu-marketing-nav">
        <Link className="otemu-marketing-brand" href="/" aria-label="OTemu, inicio">
          <span className="otemu-marketing-symbol"><Store className="size-5" aria-hidden="true" /></span>
          OTemu
        </Link>
        <nav className="otemu-marketing-actions" aria-label="Acceso a OTemu">
          <Link className="otemu-landing-ghost" href="/prototipo/disenador">Explorar diseño</Link>
          <Link className="otemu-landing-ghost" href="/demo">Entrar a demo</Link>
          <Link className="otemu-landing-ghost" href="/login">Iniciar sesión</Link>
          <Link className="otemu-landing-btn" href="/registro">Crear cuenta <ArrowRight className="size-4" /></Link>
          <ThemeToggle />
        </nav>
      </header>

      <section className="otemu-marketing-hero" aria-labelledby="otemu-marketing-title">
        <div>
          <span className="otemu-marketing-kicker"><Sparkles className="size-4" /> COMERCIO DIGITAL A TU MANERA</span>
          <h1 id="otemu-marketing-title">Tu negocio merece una tienda <em>extraordinaria.</em></h1>
          <p>Imagina tu tienda, organiza tus productos y construye una experiencia de compra que se sienta tan única como tu marca.</p>
          <div className="otemu-marketing-actions">
            <Link href="/demo" className="otemu-landing-btn">Probar sin servidor <ArrowRight className="size-4" /></Link>
            <Link href="/prototipo/disenador" className="otemu-landing-ghost">Ver editor visual <ChevronRight className="size-4" /></Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-5 text-xs font-semibold text-muted-foreground">
            <span className="flex items-center gap-2"><ShieldCheck className="size-4 text-brand-text" /> Una plataforma, muchas posibilidades</span>
            <span className="flex items-center gap-2"><Palette className="size-4 text-brand-text" /> Diseña a tu estilo</span>
          </div>
        </div>
        <div className="otemu-preview-scene" aria-label="Ilustración del panel de una tienda virtual">
          <div className="otemu-preview-window" aria-hidden="true">
            <div className="otemu-preview-window-head"><span><Store className="size-5 text-brand-text" /> Mi tienda</span><span className="text-[9px] font-semibold text-muted-foreground">Vista de ejemplo</span></div>
            <div className="otemu-preview-window-body">
              <div className="otemu-preview-window-sidebar"><i/><i/><i/><i/><i/></div>
              <div className="otemu-preview-window-content">
                <span className="text-base font-black tracking-tight">Resumen de tu tienda</span>
                <div className="otemu-preview-stat-grid">
                  <div className="otemu-preview-stat"><small>Pedidos</small><b>128</b></div>
                  <div className="otemu-preview-stat"><small>Productos</small><b>42</b></div>
                  <div className="otemu-preview-stat"><small>Visitas</small><b>1,250</b></div>
                </div>
                <div className="otemu-preview-graph">
                  {BARS.map((h, i) => <span key={i} style={{ "--bar-height": `${h}%` } as CSSProperties} />)}
                </div>
              </div>
            </div>
          </div>
          <div className="otemu-preview-floating"><span className="mr-2">✦</span> Tu tienda, tus ideas</div>
        </div>
      </section>

      <section className="otemu-features" aria-labelledby="otemu-features-title">
        <span className="otemu-marketing-kicker">DISEÑADO PARA EMPRENDER</span>
        <h2 id="otemu-features-title" className="mt-5">Todo comienza con una buena experiencia.</h2>
        <div className="otemu-feature-grid">
          <article className="otemu-feature">
            <LayoutTemplate className="size-8" />
            <h3>Una tienda que se ve como tú</h3>
            <p>Explora propuestas visuales y dale personalidad a tu escaparate sin perder claridad.</p>
          </article>
          <article className="otemu-feature">
            <Package className="size-8" />
            <h3>Productos fáciles de encontrar</h3>
            <p>Un catálogo ordenado ayuda a tus clientes a descubrir lo que ofreces.</p>
          </article>
          <article className="otemu-feature">
            <ChartNoAxesColumn className="size-8" />
            <h3>Control desde un solo panel</h3>
            <p>Revisa información sobre tus pedidos y productos con una interfaz más sencilla.</p>
          </article>
        </div>
      </section>

      <section className="otemu-marketing-cta" aria-labelledby="otemu-cta-title">
        <div>
          <h2 id="otemu-cta-title">El siguiente capítulo de tu negocio empieza aquí.</h2>
          <p>Conoce la experiencia OTemu o revisa el rediseño interactivo de la tienda.</p>
        </div>
        <Link href="/prototipo/disenador" className="otemu-landing-btn">Ver prototipo <ShoppingBag className="size-4" /></Link>
      </section>
      <footer className="otemu-landing-footer">OTemu · Una experiencia de comercio diseñada para emprendedores</footer>
    </main>
  )
}

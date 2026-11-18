"use client"

import * as React from "react"
import { Renderer, Program, Mesh, Triangle } from "ogl"
import { cn } from "@/shared/utils/cn"

const VERTICE = /* glsl */ `
attribute vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`

/**
 * Aurora de la marca: cintas de luz verde y turquesa con un toque de rosa (los colores de OTemu) sobre negro, con estrellas.
 * Se calcula entera en el fragment shader; el ratón desplaza las cintas con suavidad.
 */
const FRAGMENTO = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uMouse;
uniform float uVista;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float ruido(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * ruido(p); p = p * 2.03 + 11.7; a *= 0.5; }
  return v;
}

// Una cinta: curva ondulada, núcleo fino y resplandor ancho, con cortinas verticales que le dan textura.
float cinta(vec2 p, float base, float amp, float vel, float semilla, float ancho, out float cortina) {
  float t = uTime * vel;
  float onda = base + amp * sin(p.x * 1.25 + t * 1.1 + semilla) + 0.5 * amp * sin(p.x * 2.7 - t * 0.8 + semilla * 2.0)
             + (fbm(vec2(p.x * 0.7 + semilla, t * 0.35)) - 0.5) * amp * 1.4;
  float d = p.y - onda;
  cortina = fbm(vec2(p.x * 3.0 + t * 0.6 + semilla, d * 2.2 - t * 0.25));
  float nucleo = exp(-abs(d) * ancho * 2.6);
  float resplandor = exp(-abs(d) * ancho * 0.85);
  return nucleo * 0.7 + resplandor * 0.5;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float razon = uRes.x / uRes.y;
  // Las cintas se miden respecto a la primera pantalla (no a todo el héroe): así siempre se ven al abrir la página.
  float yv = (gl_FragCoord.y - (uRes.y - uVista)) / uVista;
  vec2 p = vec2(uv.x * razon, yv);
  p += (uMouse - 0.5) * vec2(0.18, 0.10);

  vec3 verde = vec3(0.0, 0.90, 0.60);
  vec3 turquesa = vec3(0.0, 0.64, 0.92);
  vec3 rosa = vec3(0.91, 0.12, 0.39);

  float c1, c2, c3;
  float a = cinta(p, 0.30, 0.09, 0.10, 0.0, 6.0, c1);
  float b = cinta(p, 0.47, 0.07, 0.075, 3.1, 5.0, c2);
  float c = cinta(p, 0.17, 0.06, 0.06, 6.2, 7.5, c3);

  vec3 col = vec3(0.0);
  col += mix(verde, turquesa, smoothstep(0.1, 0.9, uv.x + 0.25 * sin(uTime * 0.07))) * a * (0.26 + 0.8 * c1);
  col += mix(turquesa, verde, smoothstep(0.0, 1.0, uv.x)) * b * (0.18 + 0.55 * c2) * 0.7;
  col += rosa * c * (0.10 + 0.55 * c3) * smoothstep(0.35, 1.0, uv.x) * 0.55;

  // estrellas: celdas con un punto que parpadea, más densas cerca de las cintas
  vec2 cel = floor(gl_FragCoord.xy / 3.0);
  float e = hash(cel);
  float brillo = step(0.9972, e) * (0.5 + 0.5 * sin(uTime * (0.6 + 2.0 * hash(cel + 3.1)) + e * 40.0));
  col += vec3(0.75, 0.95, 1.0) * brillo * (0.25 + 0.9 * (a + b));

  // la parte alta, donde va el titular, queda más oscura para que el texto se lea
  col *= mix(1.0, 0.3, smoothstep(0.55, 0.95, yv));
  float vineta = smoothstep(1.25, 0.25, length(uv - 0.5) * 1.15);
  col *= vineta;
  col = pow(col, vec3(0.95));
  gl_FragColor = vec4(col, 1.0);
}
`

/** Fondo animado en WebGL. Respeta «reducir movimiento» (un solo cuadro), se pausa fuera de pantalla y cae a un degradado si no hay WebGL. */
export function FondoAurora({ className }: { className?: string }) {
  const contenedor = React.useRef<HTMLDivElement>(null)
  const [sinWebgl, setSinWebgl] = React.useState(false)

  React.useEffect(() => {
    const el = contenedor.current
    if (!el) return
    let renderer: Renderer
    try {
      renderer = new Renderer({ alpha: false, antialias: false, dpr: Math.min(window.devicePixelRatio || 1, 1.5) })
    } catch {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sin WebGL se muestra el respaldo
      setSinWebgl(true)
      return
    }
    const gl = renderer.gl
    gl.canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block"
    el.appendChild(gl.canvas)

    const geometria = new Triangle(gl)
    const objetivo = { x: 0.5, y: 0.5 }
    const raton = { x: 0.5, y: 0.5 }
    const programa = new Program(gl, {
      vertex: VERTICE,
      fragment: FRAGMENTO,
      uniforms: { uTime: { value: 0 }, uRes: { value: [1, 1] }, uMouse: { value: [0.5, 0.5] }, uVista: { value: 1 } },
    })
    const malla = new Mesh(gl, { geometry: geometria, program: programa })

    const ajustar = () => {
      const { clientWidth: w, clientHeight: h } = el
      renderer.setSize(w, h)
      programa.uniforms.uRes.value = [gl.canvas.width, gl.canvas.height]
      programa.uniforms.uVista.value = Math.min(window.innerHeight, h) * (gl.canvas.height / Math.max(h, 1))
    }
    ajustar()
    const observadorTamano = new ResizeObserver(ajustar)
    observadorTamano.observe(el)

    const movimientoReducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let visible = true
    let raf = 0
    let reloj = 0
    let anterior = performance.now()

    const pintar = (ahora: number) => {
      raf = 0
      if (!movimientoReducido) {
        reloj += (ahora - anterior) / 1000
        raton.x += (objetivo.x - raton.x) * 0.04
        raton.y += (objetivo.y - raton.y) * 0.04
      }
      anterior = ahora
      programa.uniforms.uTime.value = movimientoReducido ? 8 : reloj
      programa.uniforms.uMouse.value = [raton.x, raton.y]
      renderer.render({ scene: malla })
      if (!movimientoReducido && visible && !document.hidden) raf = requestAnimationFrame(pintar)
    }
    const arrancar = () => {
      if (raf === 0) {
        anterior = performance.now()
        raf = requestAnimationFrame(pintar)
      }
    }
    arrancar()

    const alMover = (e: PointerEvent) => {
      objetivo.x = e.clientX / window.innerWidth
      objetivo.y = 1 - e.clientY / window.innerHeight
    }
    const observadorVisible = new IntersectionObserver(([entrada]) => {
      visible = entrada.isIntersecting
      if (visible) arrancar()
    })
    observadorVisible.observe(el)
    const alCambiarVisibilidad = () => {
      if (!document.hidden) arrancar()
    }
    window.addEventListener("pointermove", alMover, { passive: true })
    document.addEventListener("visibilitychange", alCambiarVisibilidad)

    return () => {
      if (raf) cancelAnimationFrame(raf)
      observadorTamano.disconnect()
      observadorVisible.disconnect()
      window.removeEventListener("pointermove", alMover)
      document.removeEventListener("visibilitychange", alCambiarVisibilidad)
      gl.canvas.remove()
      gl.getExtension("WEBGL_lose_context")?.loseContext()
    }
  }, [])

  return (
    <div ref={contenedor} aria-hidden="true" className={cn("absolute inset-0 overflow-hidden bg-[#02070b]", className)}>
      {sinWebgl && (
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(60% 45% at 30% 70%, rgb(0 230 153 / 0.35), transparent 70%), radial-gradient(55% 40% at 75% 60%, rgb(0 163 235 / 0.30), transparent 70%)" }}
        />
      )}
    </div>
  )
}

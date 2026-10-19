/**
 * 3. Ilustración Taza Error 500: Taza rota con café derramado (Concepto específico requerido)
 */
export function Cup500Illustration({ className = "" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center select-none w-full ${className}`}>
      {/* Resplandor rojo/cálido de emergencia */}
      <div className="absolute inset-0 bg-radial from-red-600/15 via-[#4C0107]/10 to-transparent blur-3xl rounded-full pointer-events-none" />

      <svg
        viewBox="0 0 440 380"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-2xl"
      >
        <defs>
          <linearGradient id="cupGrad500" x1="60" y1="120" x2="300" y2="300" gradientUnits="userSpaceOnUse">
            <stop stopColor="#690F16" />
            <stop offset="0.6" stopColor="#4C0107" />
            <stop offset="1" stopColor="#220103" />
          </linearGradient>
          <linearGradient id="crackGlow" x1="160" y1="140" x2="230" y2="300" gradientUnits="userSpaceOnUse">
            <stop stopColor="#EF4444" />
            <stop offset="0.5" stopColor="#F59E0B" />
            <stop offset="1" stopColor="#DC2626" />
          </linearGradient>
          <linearGradient id="spillCoffeeGrad" x1="140" y1="280" x2="320" y2="340" gradientUnits="userSpaceOnUse">
            <stop stopColor="#31140F" />
            <stop offset="0.6" stopColor="#4A1E14" />
            <stop offset="1" stopColor="#260C08" />
          </linearGradient>
          <linearGradient id="saucerGrad500" x1="40" y1="280" x2="360" y2="330" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F5EFEF" />
            <stop offset="0.5" stopColor="#EDE5E6" />
            <stop offset="1" stopColor="#D8CDCF" />
          </linearGradient>
          <radialGradient id="shadowGrad500" cx="50%" cy="50%" r="50%">
            <stop stopColor="#1E0305" stopOpacity="0.4" />
            <stop offset="1" stopColor="#1E0305" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Sombra base */}
        <ellipse cx="200" cy="340" rx="170" ry="24" fill="url(#shadowGrad500)" />

        {/* Charco de café derramado en el plato y mesa */}
        <path
          d="M130 310 C150 295 190 290 240 295 C295 300 340 310 330 325 C320 338 270 345 210 343 C155 342 110 332 120 318 C123 313 126 311 130 310 Z"
          fill="url(#spillCoffeeGrad)"
          className="filter drop-shadow-md"
        />

        {/* Gotas de café derramadas dispersas */}
        <ellipse cx="350" cy="326" rx="8" ry="4.5" fill="#3B150F" />
        <ellipse cx="365" cy="331" rx="4" ry="2.5" fill="#4A1E14" />
        <ellipse cx="98" cy="328" rx="7" ry="3.8" fill="#3B150F" />
        <ellipse cx="86" cy="334" rx="3.5" ry="2" fill="#4A1E14" />

        {/* Plato / Saucer */}
        <ellipse cx="200" cy="305" rx="155" ry="32" fill="url(#saucerGrad500)" />
        <ellipse cx="200" cy="303" rx="145" ry="26" fill="#FBF8F8" />
        <ellipse cx="200" cy="303" rx="100" ry="16" fill="#EDE5E6" stroke="#D1C3C5" strokeWidth="1.5" />

        {/* Asa de la taza */}
        <path
          d="M260 180 C325 180 335 255 255 265"
          stroke="url(#cupGrad500)"
          strokeWidth="22"
          strokeLinecap="round"
          fill="none"
        />

        {/* MITAD IZQUIERDA DE LA TAZA (Ligeramente inclinada por la fractura) */}
        <g id="left-cup-half">
          <path
            d="M100 155 C100 280 135 295 190 295 L182 250 L198 215 L185 180 L200 155 Z"
            fill="url(#cupGrad500)"
          />
          {/* Borde superior izquierdo */}
          <path
            d="M100 155 C100 142 145 133 200 133 L185 155 C145 155 105 150 100 155 Z"
            fill="#690F16"
          />
        </g>

        {/* MITAD DERECHA DE LA TAZA (Separada por la grieta y desplazada) */}
        <g id="right-cup-half" transform="translate(6, 2) rotate(2 250 220)">
          <path
            d="M205 155 L190 180 L203 215 L188 250 L196 295 C250 295 300 280 300 155 Z"
            fill="url(#cupGrad500)"
          />
          {/* Borde superior derecho */}
          <path
            d="M205 155 C255 155 295 145 300 155 C300 168 255 178 205 178 Z"
            fill="#560A10"
          />
        </g>

        {/* LA GRAN GRIETA CENTRAL (Kintsugi roto / quiebre nítido) */}
        <path
          d="M198 135 L184 178 L201 214 L186 250 L194 298"
          stroke="#EF4444"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="bevel"
          fill="none"
        />
        {/* Resplandor interno de la fractura */}
        <path
          d="M198 135 L184 178 L201 214 L186 250 L194 298"
          stroke="#FCD34D"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="bevel"
          fill="none"
        />

        {/* Café escurriendo por la grieta exterior */}
        <path
          d="M187 235 Q192 260 193 295"
          stroke="#31140F"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="193" cy="285" r="3" fill="#4A1E14" />

        {/* Fragmento / Trozo de cerámica roto en el plato */}
        <polygon
          points="270,305 288,298 296,312 278,315"
          fill="#690F16"
          stroke="#4C0107"
          strokeWidth="1.5"
          className="filter drop-shadow-sm"
        />
        <polygon
          points="272,306 286,300 292,308 278,312"
          fill="#831821"
        />

        {/* Vapor errático y cortado */}
        <path
          d="M150 120 C140 100 155 85 145 65"
          stroke="#EF4444"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="4 4"
          opacity="0.6"
          fill="none"
        />
        <path
          d="M240 120 C250 95 235 80 250 55"
          stroke="#9CA3AF"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="4 4"
          opacity="0.5"
          fill="none"
        />

        {/* Pequeño icono de advertencia sobre la rotura */}
        <g transform="translate(186, 92)">
          <circle cx="14" cy="14" r="14" fill="#FEF2F2" stroke="#EF4444" strokeWidth="2" />
          <path d="M14 8 V16" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="14" cy="20" r="1.5" fill="#DC2626" />
        </g>
      </svg>
    </div>
  )
}

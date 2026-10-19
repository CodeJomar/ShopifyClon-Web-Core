/**
 * 1. Ilustración Taza Error 404: Taza vacía con vapor enigmático y rastro de café desvanecido
 */
export function Cup404Illustration({ className = "" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center select-none w-full ${className}`}>
      {/* Fondo con aura suave */}
      <div className="absolute inset-0 bg-radial from-[#4C0107]/10 via-amber-500/5 to-transparent blur-3xl rounded-full pointer-events-none" />

      <svg
        viewBox="0 0 440 380"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-2xl"
      >
        <defs>
          <linearGradient id="cupGrad404" x1="60" y1="120" x2="300" y2="300" gradientUnits="userSpaceOnUse">
            <stop stopColor="#690F16" />
            <stop offset="0.6" stopColor="#4C0107" />
            <stop offset="1" stopColor="#2D0104" />
          </linearGradient>
          <linearGradient id="innerRim404" x1="100" y1="130" x2="260" y2="170" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E2D6D8" />
            <stop offset="1" stopColor="#C9B7BA" />
          </linearGradient>
          <linearGradient id="saucerGrad404" x1="40" y1="280" x2="360" y2="330" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F5EFEF" />
            <stop offset="0.5" stopColor="#EDE5E6" />
            <stop offset="1" stopColor="#D8CDCF" />
          </linearGradient>
          <linearGradient id="steamGrad404" x1="180" y1="140" x2="180" y2="30" gradientUnits="userSpaceOnUse">
            <stop stopColor="#9C7A80" stopOpacity="0.7" />
            <stop offset="0.8" stopColor="#C4B0B4" stopOpacity="0.2" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="shadowGrad404" cx="50%" cy="50%" r="50%">
            <stop stopColor="#1E0305" stopOpacity="0.35" />
            <stop offset="1" stopColor="#1E0305" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Sombra de la base */}
        <ellipse cx="200" cy="340" rx="170" ry="24" fill="url(#shadowGrad404)" />

        {/* Plato / Saucer */}
        <ellipse cx="200" cy="305" rx="155" ry="32" fill="url(#saucerGrad404)" />
        <ellipse cx="200" cy="303" rx="145" ry="26" fill="#FBF8F8" />
        <ellipse cx="200" cy="303" rx="100" ry="16" fill="#EDE5E6" stroke="#D1C3C5" strokeWidth="1.5" />

        {/* Asa de la taza */}
        <path
          d="M260 180 C325 180 335 255 255 265"
          stroke="url(#cupGrad404)"
          strokeWidth="22"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M260 180 C310 185 320 250 255 262"
          stroke="#7A151D"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
        />

        {/* Cuerpo de la taza */}
        <path
          d="M100 155 C100 280 140 295 200 295 C260 295 300 280 300 155 Z"
          fill="url(#cupGrad404)"
        />

        {/* Reflejo vertical de cerámica pulida */}
        <path
          d="M125 165 C122 230 135 270 148 280 C143 270 136 230 138 165 Z"
          fill="#FFFFFF"
          opacity="0.18"
        />

        {/* Borde exterior superior */}
        <ellipse cx="200" cy="155" rx="100" ry="26" fill="#690F16" />

        {/* Interior de la taza (Vacío / Profundo) */}
        <ellipse cx="200" cy="155" rx="92" ry="22" fill="url(#innerRim404)" />
        <ellipse cx="200" cy="162" rx="76" ry="16" fill="#6B5B5E" />
        <ellipse cx="200" cy="164" rx="64" ry="12" fill="#4A3C3E" />

        {/* Círculo punteado de búsqueda / "Objeto no encontrado" en el fondo */}
        <ellipse
          cx="200"
          cy="164"
          rx="44"
          ry="8"
          fill="none"
          stroke="#EDE5E6"
          strokeWidth="1.5"
          strokeDasharray="4 3"
          opacity="0.6"
        />

        {/* Grano de café fantasma en el fondo de la taza */}
        <path
          d="M196 161 C193 162 193 166 198 167 C203 168 206 165 205 163 C204 161 199 160 196 161 Z"
          fill="#3B1C1E"
        />
        <path d="M196 161 Q200 164 204 164" stroke="#EDE5E6" strokeWidth="0.8" opacity="0.7" fill="none" />

        {/* Volutas de vapor disipándose en formas de signos de interrogación */}
        <g opacity="0.85">
          {/* Vapor 1 (Interrogación izquierda) */}
          <path
            d="M165 140 C155 110 140 85 158 60 C170 42 192 48 184 70 C180 80 172 88 174 100"
            stroke="url(#steamGrad404)"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="174" cy="115" r="2.5" fill="#C4B0B4" opacity="0.6" />

          {/* Vapor 2 central alto */}
          <path
            d="M205 135 C200 100 230 80 215 45 C205 25 210 15 205 10"
            stroke="url(#steamGrad404)"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />

          {/* Vapor 3 derecha */}
          <path
            d="M245 140 C260 115 255 90 240 68 C230 52 245 35 255 30"
            stroke="url(#steamGrad404)"
            strokeWidth="4.5"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* Granos de café en el plato */}
        <g transform="translate(85, 290) rotate(-20)">
          <ellipse cx="12" cy="7" rx="9" ry="5.5" fill="#3E1A1D" />
          <path d="M5 7 Q12 10 19 6" stroke="#EDE5E6" strokeWidth="1" opacity="0.6" fill="none" />
        </g>
        <g transform="translate(105, 305) rotate(15)">
          <ellipse cx="10" cy="6" rx="8" ry="5" fill="#4C2226" />
          <path d="M4 6 Q10 4 16 7" stroke="#EDE5E6" strokeWidth="0.9" opacity="0.6" fill="none" />
        </g>
      </svg>
    </div>
  )
}

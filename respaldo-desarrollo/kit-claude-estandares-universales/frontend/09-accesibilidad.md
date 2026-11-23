# Accesibilidad

- **Semántica**: lo que se pulsa es un botón; lo que navega es un enlace; no se simulan con contenedores genéricos.
- Cada control tiene **nombre accesible** (etiqueta visible o `aria-label`); los íconos solos llevan etiqueta.
- **Teclado**: todo es alcanzable y operable; el orden de tabulación sigue el visual; Escape cierra paneles y diálogos.
- **Foco visible** en todos los controles interactivos (solo con teclado) y foco que entra y vuelve en paneles y diálogos.
- **Contraste** suficiente en claro y oscuro; el estado nunca se comunica solo con color (texto o ícono acompañan).
- Los diálogos y paneles declaran su rol y su título; los avisos importantes se anuncian a lectores de pantalla.
- Respeto a la preferencia de movimiento reducido en animaciones largas.
- Objetivos táctiles de tamaño suficiente (ver `05-ux-tactil-y-responsivo.md`).
- Los textos de error explican qué hacer, no solo qué falló.

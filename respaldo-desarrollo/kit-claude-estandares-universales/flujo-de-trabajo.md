# Flujo de trabajo con Claude

Acuerdos de trabajo por defecto. Cada proyecto puede ajustar la sección «Acuerdos editables» al final.

## Orden de trabajo
1. **Entender**: leer el código y los documentos del módulo antes de proponer.
2. **Opinar antes de construir** cuando hay una decisión de diseño: una recomendación con sus compromisos, no un catálogo de opciones. Los cambios grandes esperan confirmación.
3. **Plan por módulo** en cambios grandes: consultas o pantallas actuales, firmas nuevas, riesgos, pruebas, pasos. El modelo más fuerte analiza y escribe el plan; otro lo implementa módulo por módulo guiado por esos documentos.
4. **Pruebas que fijan el comportamiento** antes de tocar nada en una refactorización.
5. **Implementar en pasos pequeños**, cada uno compilable y probado.
6. **Verificar** con las herramientas reales: compilación, lint, pruebas, y la interfaz en un navegador real a los anchos objetivo.
7. **Reportar**.

## Evaluar antes de corregir
Cuando llega una lista de errores o dudas, primero se clasifica cada punto y se responde, antes de cambiar código:

| Clase | Qué es | Acción |
|---|---|---|
| Error | El sistema hace algo incorrecto | Corregir con prueba |
| Diseño | Es consecuencia de una decisión del producto | Explicar; cambiar solo si se decide |
| Uso | El sistema hace lo configurado | Explicar |
| Pregunta | Falta contexto | Responder o preguntar |
| Medir | Sensación sin dato (p. ej. «se siente lento») | Pedir dónde, cuándo y en qué entorno |

## Reporte honesto
- Qué se hizo, con archivos y comandos reproducibles.
- Qué se verificó y cómo. Lo verificado se afirma sin rodeos.
- **Qué no se pudo verificar** y por qué (dispositivo táctil, rol sin permiso, entorno ajeno).
- Observaciones que no se corrigieron, para decidir aparte.
- Nunca se declara «listo» sin haber ejecutado las comprobaciones.

## Git
- Commits atómicos por módulo o tema, con mensaje que explica el cambio y su motivo.
- Antes de refactorizar, las pruebas van en su propio commit.
- Flujo de ramas típico: se trabaja y se prueba en la rama de desarrollo; recién entonces se promueve a la de producción con avance rápido (sin commits de merge).
- Acciones difíciles de revertir o visibles para otros (push, merge a producción, borrar, publicar) se hacen solo cuando el usuario lo pide, o cuando lo dejó autorizado de forma explícita para ese flujo.

## Cuando el usuario corrige
Una corrección de patrón («usa el componente estándar», «mismo orden que el POS») no es solo un arreglo: se convierte en regla en estos estándares para no repetirla.

## Presupuesto de uso
Si el presupuesto o la cuota es limitado, se planifica por piezas que dejan el árbol en verde (compila, pruebas pasan, commit hecho) y se avisa antes de empezar una pieza que no cabe. Nunca se deja trabajo a medias.

## Acuerdos editables (completar por proyecto)
- Commits: [con / sin] coautor de Claude.
- Push y merge: [solo cuando se pida / autorizado hasta rama X].
- Idioma de código, mensajes y documentación: [completar].
- Ramas: [completar].

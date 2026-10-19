"use client"

import * as React from "react"

import type { PedidoListadoDto } from "@/dtos/pedidos"
import { toast } from "@/shared/components/ui/toast"
import { useAhora } from "@/shared/hooks/use-ahora"
import { aCentimos } from "@/shared/utils/dinero"

import type { PedidoACobrar } from "../components/cobro-tipos"
import {
  FILTRO_TODAS_LAS_AREAS,
  MAX_CANTIDAD_ITEM,
  areaDeMesa,
  areasDeMesas,
  type MesaPos,
  type ProductoPos,
  type TipoAtencion,
} from "../schema"
import { useAtajoBusqueda } from "./use-atajo-busqueda"
import { useCarrito, type ConfiguracionItem } from "./use-carrito"
import { useCatalogoPos } from "./use-catalogo-pos"
import { useEnvioPedido } from "./use-envio-pedido"
import { usePedidosPorCobrar } from "./use-pedidos-por-cobrar"

export type VistaPos = "catalogo" | "mesas"

/** "#12 · Mesa 3" para identificar un pedido en el cobro. */
const etiquetaPedido = (p: Pick<PedidoListadoDto, "id_pedido" | "correlativo" | "mesa_numero" | "tipo_pedido">): string =>
  `#${p.correlativo} · ${p.tipo_pedido === "salon" && p.mesa_numero ? `Mesa ${p.mesa_numero}` : "Para llevar"}`

interface PermisosPos {
  puedeCrear: boolean
  puedeCobrar: boolean
}

/**
 * Orquesta la terminal del POS: catálogo y mesas vivos, comanda en armado, mesa elegida, pedidos por cobrar y los
 * modales de personalización, cobro y confirmación. La vista solo pinta lo que este hook entrega.
 */
export function useTerminalPos({ puedeCrear, puedeCobrar }: PermisosPos) {
  const catalogo = useCatalogoPos()
  const { productos, mesas, recargarMesas } = catalogo
  const carrito = useCarrito()
  const { items, agregar, vaciar } = carrito
  const envio = useEnvioPedido()

  // Los minutos de ocupación de cada mesa se recalculan en el navegador cada medio minuto.
  const ahora = useAhora(30_000)

  const [vistaActiva, setVistaActiva] = React.useState<VistaPos>("catalogo")
  const busquedaRef = useAtajoBusqueda(() => setVistaActiva("catalogo"))

  // Productos marcados como Agotado desde el Menú (no se pueden sumar más unidades)
  const productosAgotados = React.useMemo(
    () => new Set(productos.filter((p) => !p.disponible).map((p) => p.id_producto)),
    [productos],
  )

  /* ------------------------------ Mesas y áreas ----------------------------- */

  const [areaSeleccionada, setAreaSeleccionada] = React.useState<string>(FILTRO_TODAS_LAS_AREAS)
  // Las áreas salen de las mesas (texto libre que administra el propietario); si el área filtrada desaparece, se muestran todas.
  const areas = React.useMemo(() => areasDeMesas(mesas), [mesas])
  const areaFiltro =
    areaSeleccionada !== FILTRO_TODAS_LAS_AREAS && areas.includes(areaSeleccionada) ? areaSeleccionada : FILTRO_TODAS_LAS_AREAS
  const mesasFiltradas = React.useMemo(
    () => mesas.filter((m) => areaFiltro === FILTRO_TODAS_LAS_AREAS || areaDeMesa(m) === areaFiltro),
    [mesas, areaFiltro],
  )

  /* --------------------------- Pedido en armado ---------------------------- */

  const [tipoPedido, setTipoPedido] = React.useState<TipoAtencion>("salon")
  const [mesaSeleccionadaId, setMesaSeleccionadaId] = React.useState<string | null>(null)
  const [nombreCliente, setNombreCliente] = React.useState("")
  const mesaSeleccionada = React.useMemo(
    () => mesas.find((m) => m.id_mesa === mesaSeleccionadaId) ?? null,
    [mesas, mesaSeleccionadaId],
  )

  // Pedidos de la mesa seleccionada con saldo por cobrar (se refrescan cuando cambia el estado de la mesa)
  const refrescarPedidos = `${mesaSeleccionada?.estado}|${mesaSeleccionada?.pedidos_activos}|${mesaSeleccionada?.pedido_activo?.total}`
  const { pedidos: pedidosMesa, recargar: recargarPedidosMesa } = usePedidosPorCobrar(
    tipoPedido === "salon" ? mesaSeleccionadaId : null,
    refrescarPedidos,
  )
  const saldoMesaCentimos = pedidosMesa.reduce((suma, p) => suma + aCentimos(p.saldo_pendiente), 0)

  const faltaMesa = tipoPedido === "salon" && !mesaSeleccionada
  const mesaPorLimpiar = tipoPedido === "salon" && mesaSeleccionada?.estado === "por_limpiar"
  const puedeEnviar = puedeCrear && items.length > 0 && !faltaMesa && !mesaPorLimpiar
  const puedeCobrarAhora = puedeCobrar && ((items.length > 0 && !faltaMesa && !mesaPorLimpiar) || pedidosMesa.length > 0)
  const destinoActual = tipoPedido === "salon" && mesaSeleccionada ? `Mesa ${mesaSeleccionada.numero}` : "Para llevar"

  /* --------------------------------- Modales -------------------------------- */

  const [pedidosParaCobrar, setPedidosParaCobrar] = React.useState<PedidoACobrar[] | null>(null)
  const [productoParaPersonalizar, setProductoParaPersonalizar] = React.useState<ProductoPos | null>(null)
  const [destinoEnviado, setDestinoEnviado] = React.useState("")

  /* -------------------------------- Acciones -------------------------------- */

  // Envío de la comanda a cocina y barra: crea el pedido en la API
  const enviarACocina = async () => {
    if (!puedeEnviar) return
    const destino = destinoActual
    const pedido = await envio.enviar(items, tipoPedido, mesaSeleccionadaId, nombreCliente)
    if (pedido) {
      setDestinoEnviado(destino)
      vaciar()
      setNombreCliente("")
      void recargarMesas(true)
    }
  }

  // Cobro: con comanda armada se crea el pedido y se cobra; sin ella, se cobran los pedidos de la mesa.
  const cobrar = async () => {
    if (!puedeCobrarAhora) return
    if (items.length > 0) {
      const destino = destinoActual
      const pedido = await envio.enviar(items, tipoPedido, mesaSeleccionadaId, nombreCliente)
      if (!pedido) return
      envio.limpiar() // el aviso de "comanda enviada" no hace falta: se pasa directo al cobro
      vaciar()
      setNombreCliente("")
      void recargarMesas(true)
      setPedidosParaCobrar([
        {
          id_pedido: pedido.id_pedido,
          etiqueta: `#${pedido.correlativo} · ${destino}`,
          total: pedido.total_calculado,
          saldo_pendiente: pedido.total_calculado,
        },
      ])
      return
    }
    setPedidosParaCobrar(
      pedidosMesa.map((p) => ({
        id_pedido: p.id_pedido,
        etiqueta: etiquetaPedido(p),
        total: p.total_calculado,
        saldo_pendiente: p.saldo_pendiente,
      })),
    )
  }

  const terminarCobro = () => {
    void recargarMesas(true)
    void recargarPedidosMesa()
  }

  const seleccionarMesa = (mesa: MesaPos) => {
    setMesaSeleccionadaId(mesa.id_mesa)
    setTipoPedido("salon")
    setVistaActiva("catalogo")
  }

  // Tocar un producto abre su panel de extras y nota; el producto entra a la comanda desde ahí.
  const seleccionarProducto = (producto: ProductoPos) => {
    if ((carrito.cantidades.get(producto.id_producto) ?? 0) >= MAX_CANTIDAD_ITEM) {
      toast.add({ type: "warning", title: "Máximo por producto", description: `Ya hay ${MAX_CANTIDAD_ITEM} de ${producto.nombre} en la comanda.`, timeout: 2500 })
      return
    }
    setProductoParaPersonalizar(producto)
  }

  // El aviso de «producto agregado» se reemplaza en vez de apilarse cuando se agregan varios seguidos.
  const avisoAgregado = React.useRef<string | null>(null)
  const confirmarPersonalizacion = (configuracion: ConfiguracionItem) => {
    if (!productoParaPersonalizar) return
    agregar(productoParaPersonalizar, configuracion)
    if (avisoAgregado.current) toast.close(avisoAgregado.current)
    avisoAgregado.current = toast.add({ type: "success", title: "Producto agregado", description: productoParaPersonalizar.nombre, timeout: 1800 })
    setProductoParaPersonalizar(null)
  }

  return {
    catalogo,
    carrito,
    envio,
    ahora,
    vistaActiva,
    setVistaActiva,
    busquedaRef,
    productosAgotados,
    areas,
    areaFiltro,
    setAreaSeleccionada,
    mesasFiltradas,
    tipoPedido,
    setTipoPedido,
    mesaSeleccionada,
    setMesaSeleccionadaId,
    nombreCliente,
    setNombreCliente,
    pedidosMesa,
    saldoMesaCentimos,
    faltaMesa,
    mesaPorLimpiar,
    puedeEnviar,
    puedeCobrarAhora,
    pedidosParaCobrar,
    setPedidosParaCobrar,
    productoParaPersonalizar,
    setProductoParaPersonalizar,
    destinoEnviado,
    enviarACocina,
    cobrar,
    terminarCobro,
    seleccionarMesa,
    seleccionarProducto,
    confirmarPersonalizacion,
  }
}

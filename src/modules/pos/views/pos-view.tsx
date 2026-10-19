"use client"

import { useCan } from "@/modules/auth"
import { ACCION, MODULO } from "@/shared/constants/permisos"

import { CatalogoPanel } from "../components/catalogo-panel"
import { ComandaDespachadaModal } from "../components/comanda-despachada-modal"
import { CobroModal } from "../components/cobro-modal"
import { MesasPanel } from "../components/mesas-panel"
import { PersonalizarProductoPanel } from "../components/personalizar-producto-panel"
import { PosEncabezado } from "../components/pos-encabezado"
import { TicketPanel } from "../components/ticket-panel"
import { useTerminalPos } from "../hooks/use-terminal-pos"

/** Terminal POS: catálogo o mapa de mesas a la izquierda y la comanda en armado a la derecha. */
export function PosView() {
  const { puede } = useCan()
  // Entrar al POS lo exige la ruta (ORDERS:CREAR); aquí se decide qué más puede hacer cada cargo.
  const puedeCrear = puede({ modulo: MODULO.ORDERS, accion: ACCION.CREAR })
  const puedeCobrar = puede({ modulo: MODULO.TRANSACTIONS, accion: ACCION.COBRAR })
  const puedeLiberarMesa = puede({ modulo: MODULO.TABLES, accion: ACCION.CAMBIAR_ESTADO })

  const pos = useTerminalPos({ puedeCrear, puedeCobrar })
  const { catalogo, carrito, envio } = pos

  // El título y el selector de vista viven dentro del contenedor de la izquierda: así ambos lados ganan alto.
  const encabezado = (
    <PosEncabezado
      enVivo={catalogo.enVivo}
      vistaActiva={pos.vistaActiva}
      onCambiarVista={pos.setVistaActiva}
      totalMesas={catalogo.isLoading ? null : catalogo.mesas.length}
    />
  )

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto lg:overflow-hidden">
      {/* Grid de 12 columnas del POS (7:5 en lg, 8:4 en xl); ocupa el alto disponible y cada lado maneja su propio contenido */}
      <div className="grid min-h-0 flex-1 grid-cols-12 gap-4 lg:gap-5">
        <div className="col-span-12 flex min-h-[520px] flex-col lg:col-span-7 lg:min-h-0 xl:col-span-8">
          {pos.vistaActiva === "catalogo" ? (
            <CatalogoPanel
              encabezado={encabezado}
              catalogo={catalogo}
              cantidades={carrito.cantidades}
              puedeCrear={puedeCrear}
              busquedaRef={pos.busquedaRef}
              onSeleccionar={pos.seleccionarProducto}
            />
          ) : (
            <MesasPanel
              encabezado={encabezado}
              mesas={pos.mesasFiltradas}
              areas={pos.areas}
              areaFiltro={pos.areaFiltro}
              onCambiarArea={pos.setAreaSeleccionada}
              mesaSeleccionadaId={pos.mesaSeleccionada?.id_mesa ?? null}
              ahora={pos.ahora}
              isLoading={catalogo.isLoading}
              puedeLiberar={puedeLiberarMesa}
              onSeleccionar={pos.seleccionarMesa}
              onLiberar={catalogo.marcarMesaLibre}
            />
          )}
        </div>

        <div className="col-span-12 flex min-h-[560px] flex-col lg:col-span-5 lg:min-h-0 xl:col-span-4">
          <TicketPanel
            items={carrito.items}
            totales={carrito.totales}
            mesas={catalogo.mesas}
            tipoPedido={pos.tipoPedido}
            onTipoPedidoChange={pos.setTipoPedido}
            mesaSeleccionada={pos.mesaSeleccionada}
            pedidosMesa={pos.pedidosMesa}
            saldoMesaCentimos={pos.saldoMesaCentimos}
            onMesaChange={(id) => pos.setMesaSeleccionadaId(id || null)}
            nombreCliente={pos.nombreCliente}
            onNombreClienteChange={pos.setNombreCliente}
            onCambiarCantidad={carrito.cambiarCantidad}
            productosAgotados={pos.productosAgotados}
            onQuitar={carrito.quitar}
            onVaciar={carrito.vaciar}
            puedeCrear={puedeCrear}
            puedeCobrar={puedeCobrar}
            faltaMesa={pos.faltaMesa}
            mesaPorLimpiar={pos.mesaPorLimpiar}
            puedeEnviar={pos.puedeEnviar}
            puedeCobrarAhora={pos.puedeCobrarAhora}
            enviandoComanda={envio.isSending}
            onEnviarCocina={pos.enviarACocina}
            onCobrar={() => void pos.cobrar()}
          />
        </div>
      </div>

      {/* Cobro de un pedido: pago mixto o parcial */}
      {pos.pedidosParaCobrar && (
        <CobroModal pedidos={pos.pedidosParaCobrar} onClose={() => pos.setPedidosParaCobrar(null)} onCobrado={pos.terminarCobro} />
      )}

      {/* Extras del producto y nota de preparación */}
      {pos.productoParaPersonalizar && (
        <PersonalizarProductoPanel
          key={pos.productoParaPersonalizar.id_producto}
          producto={pos.productoParaPersonalizar}
          onClose={() => pos.setProductoParaPersonalizar(null)}
          onConfirmar={pos.confirmarPersonalizacion}
        />
      )}

      {/* Aviso al despachar la comanda a cocina */}
      {envio.pedidoEnviado && (
        <ComandaDespachadaModal pedido={envio.pedidoEnviado} destino={pos.destinoEnviado} onClose={envio.limpiar} />
      )}
    </div>
  )
}

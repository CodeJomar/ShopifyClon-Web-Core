import { Button } from "@/shared/components/ui/button"

/** Pie estándar de los paneles de formulario: cancelar y guardar (el guardado envía el formulario por su id). */
export function PieFormulario({
  formId,
  onCancelar,
  enviando,
  textoEnviar,
}: {
  formId: string
  onCancelar: () => void
  enviando: boolean
  textoEnviar: string
}) {
  return (
    <>
      <Button type="button" variant="neutral" size="md" onClick={onCancelar} disabled={enviando}>
        Cancelar
      </Button>
      <Button type="submit" form={formId} size="md" disabled={enviando}>
        {textoEnviar}
      </Button>
    </>
  )
}

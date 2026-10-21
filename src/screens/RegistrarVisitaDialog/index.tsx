import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { Badge, Button, Dialog, FeedbackDialog, IconButton, ListItem, SearchBar, TextField } from '@/components';
import { colors } from '@/theme/tokens';
import { RepartoApiError } from '@/api/repartoApiClient';
import { useCatalogo, useControlPlaya } from '@/hooks/useCatalogos';
import { useStockEnRuta } from '@/hooks/useStockEnRuta';
import { queuedWrites } from '@/sync/queuedWrites';
import type { ClienteVisita, ProductoCatalogo } from '@/api/types';
import type {
  FeedbackState,
  LineaArticuloEditable,
  LineaEnvaseEditable,
  MedioPago,
  ModoVisita,
  PickerForType,
  RegistrarVisitaDialogProps,
  ResultadoVisita,
} from './types';
import { styles } from './styles';
import {
  buscarLineaExcedida,
  calcularStockDisponible,
  calcularTotalVentaArticulos,
  filtrarProductosPicker,
  formatPrecio,
  hayLineasExcedidas,
} from './utils';

export type {
  RegistrarVisitaDialogProps,
  ModoVisita,
  MedioPago,
  ResultadoVisita,
  LineaArticuloEditable,
  LineaEnvaseEditable,
  FeedbackState,
};

/**
 * "Gestiones" on a client's card (CardActionBar, Paso 2.4) opens this —
 * registers one insa.movimiento.cliente via POST /insa/api/visita. The two
 * modes mirror the backend's own resultado field help text ("dejar vacío
 * si hubo venta, cobro o movimiento de envase; completar solo para una
 * visita sin transacción") — they're mutually exclusive, not a UI opinion.
 */
export function RegistrarVisitaDialog({
  visible,
  onClose,
  deliveryDate,
  cliente,
  onSaved,
  readOnly = false,
}: RegistrarVisitaDialogProps) {
  const queryClient = useQueryClient();
  const [modo, setModo] = useState<ModoVisita>('sin_transaccion');
  const [resultado, setResultado] = useState<ResultadoVisita>(null);
  const [porWhatsapp, setPorWhatsapp] = useState(false);

  const [medioPago, setMedioPago] = useState<MedioPago>('efectivo');
  const [referenciaPago, setReferenciaPago] = useState('');

  const [lineasArticulo, setLineasArticulo] = useState<LineaArticuloEditable[]>([]);
  const [lineasEnvase, setLineasEnvase] = useState<LineaEnvaseEditable[]>([]);

  // Cached + persisted so "Registrar visita" works offline (see
  // src/hooks/useCatalogos.ts + src/sync/queryPersister.ts).
  const { data: catalogo = [], isLoading: loadingCatalogo, isError: catalogoError } = useCatalogo();
  const { data: controlPlaya, isLoading: loadingControlPlaya } = useControlPlaya(deliveryDate);
  const { data: stockEnRuta = [] } = useStockEnRuta(deliveryDate);

  const controlSalida = controlPlaya?.salida;
  const salidaAprobada = Boolean(controlSalida?.aprobado);

  const [pickerFor, setPickerFor] = useState<PickerForType>(null);
  const [pickerQuery, setPickerQuery] = useState('');

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [savedCliente, setSavedCliente] = useState<ClienteVisita | null>(null);

  // Mapeo de stock disponible por producto.
  // Si estamos editando una visita guardada para este cliente, sumamos lo que ya tenía asignado.
  const stockDisponiblePorProducto = useMemo(
    () => calcularStockDisponible(stockEnRuta, cliente),
    [stockEnRuta, cliente],
  );

  // Pedido original / habitual del cliente
  const pedidoOriginal = useMemo(() => {
    if (!cliente) return [];
    if (cliente.articulosSolicitados && cliente.articulosSolicitados.length > 0) {
      return cliente.articulosSolicitados.map((a) => ({
        productId: a.productId,
        nombre: a.producto,
        cantidad: a.cantidad,
      }));
    }
    if (cliente.pedidoHabitual && cliente.pedidoHabitual.length > 0) {
      return cliente.pedidoHabitual.map((p) => ({
        productId: p.productId,
        nombre: p.producto,
        cantidad: p.cantidad,
      }));
    }
    return [];
  }, [cliente]);

  const pedidoOriginalMap = useMemo(() => {
    return new Map<number, number>(pedidoOriginal.map((p) => [p.productId, p.cantidad]));
  }, [pedidoOriginal]);

  // Reset or pre-populate the form each time the dialog opens or client changes.
  useEffect(() => {
    if (!visible) {
      setModo('sin_transaccion');
      setResultado(null);
      setPorWhatsapp(false);
      setMedioPago('efectivo');
      setReferenciaPago('');
      setLineasArticulo([]);
      setLineasEnvase([]);
      setPickerFor(null);
      setPickerQuery('');
      setErrorMsg(null);
      setFeedback(null);
      setSavedCliente(null);
    } else if (cliente) {
      // Envases desde insa.saldo.envase del cliente
      const envasesDelCliente: LineaEnvaseEditable[] =
        cliente.saldosEnvase && cliente.saldosEnvase.length > 0
          ? cliente.saldosEnvase.map((s) => ({
              productId: s.productId,
              nombre: s.producto,
              tipo: 'devolucion',
              cantidad: String(s.cantidadARecuperar > 0 ? s.cantidadARecuperar : s.saldo),
            }))
          : (cliente.deudaEnvases || []).map((d) => ({
              productId: d.productId,
              nombre: d.producto,
              tipo: 'devolucion',
              cantidad: String(d.cantidadARecuperar > 0 ? d.cantidadARecuperar : d.saldo),
            }));

      if (cliente.visitado) {
        const hasTransaction =
          (cliente.lineasArticulo && cliente.lineasArticulo.length > 0) ||
          (cliente.lineasEnvase && cliente.lineasEnvase.length > 0) ||
          (cliente.cobroEfectivo && cliente.cobroEfectivo > 0);

        if (hasTransaction) {
          setModo('transaccion');
          setResultado(null);
          setPorWhatsapp(false);
          setMedioPago(cliente.medioPago === 'transferencia' ? 'transferencia' : 'efectivo');
          setReferenciaPago(cliente.referenciaPago || '');
          setLineasArticulo(
            (cliente.lineasArticulo || []).map((l) => ({
              productId: l.productId,
              nombre: l.nombre || '',
              tipo: l.tipo === 'devolucion' ? 'devolucion' : 'venta',
              cantidad: String(l.cantidad),
              precioUnitario: String(l.precioUnitario ?? 0),
            }))
          );
          setLineasEnvase(
            cliente.lineasEnvase && cliente.lineasEnvase.length > 0
              ? cliente.lineasEnvase.map((l) => ({
                  productId: l.productId,
                  nombre: l.nombre || '',
                  tipo: l.tipo === 'devolucion' ? 'devolucion' : 'prestamo',
                  cantidad: String(l.cantidad),
                }))
              : envasesDelCliente
          );
        } else {
          setModo('sin_transaccion');
          setResultado(
            cliente.resultado === 'ausente' || cliente.resultado === 'sin_gestion'
              ? cliente.resultado
              : null
          );
          setPorWhatsapp(false);
          setMedioPago('efectivo');
          setReferenciaPago('');
          setLineasArticulo([]);
          setLineasEnvase([]);
        }
      } else {
        // Carga automática del pedido original / habitual del cliente
        if (pedidoOriginal.length > 0) {
          setModo('transaccion');
          setResultado(null);
          setPorWhatsapp(false);
          setMedioPago('efectivo');
          setReferenciaPago('');
          setLineasArticulo(
            pedidoOriginal.map((p) => {
              const prod = catalogo.find((c) => c.productId === p.productId);
              return {
                productId: p.productId,
                nombre: p.nombre || prod?.nombre || '',
                tipo: 'venta',
                cantidad: String(p.cantidad),
                precioUnitario: String(prod?.precio ?? 0),
              };
            })
          );
          setLineasEnvase(envasesDelCliente);
        } else {
          setModo('sin_transaccion');
          setResultado(null);
          setPorWhatsapp(false);
          setMedioPago('efectivo');
          setReferenciaPago('');
          setLineasArticulo([]);
          setLineasEnvase(envasesDelCliente);
        }
      }
    }
  }, [visible, cliente, catalogo, pedidoOriginal]);

  useEffect(() => {
    if (catalogoError) setErrorMsg('No se pudo cargar el catálogo de artículos.');
  }, [catalogoError]);

  // Solo artículos aprobados en el control de playa de salida
  const articulosSalidaAprobados = useMemo(() => {
    if (!controlSalida?.aprobado || !controlSalida.lineas) return [];
    const mapSalida = new Map(controlSalida.lineas.map((l) => [l.productId, l]));
    return catalogo.filter((p) => mapSalida.has(p.productId));
  }, [controlSalida, catalogo]);

  // Envases (préstamo/devolución) only make sense for retornable products
  const productosEnvase = useMemo(() => catalogo.filter((p) => p.esRetornable), [catalogo]);
  const productosPicker = pickerFor === 'envase' ? productosEnvase : articulosSalidaAprobados;

  const productosFiltrados = useMemo(
    () => filtrarProductosPicker(productosPicker, pickerQuery),
    [productosPicker, pickerQuery],
  );

  const totalVentaArticulos = useMemo(
    () => calcularTotalVentaArticulos(lineasArticulo),
    [lineasArticulo],
  );

  const lineasExcedidas = useMemo(
    () => hayLineasExcedidas(modo, lineasArticulo, stockDisponiblePorProducto),
    [modo, lineasArticulo, stockDisponiblePorProducto],
  );

  function cambiarModo(next: ModoVisita) {
    setModo(next);
    setResultado(null);
    setPorWhatsapp(false);
    setMedioPago('efectivo');
    setReferenciaPago('');
    if (next === 'transaccion') {
      if (lineasArticulo.length === 0 && pedidoOriginal.length > 0) {
        setLineasArticulo(
          pedidoOriginal.map((p) => {
            const prod = catalogo.find((c) => c.productId === p.productId);
            return {
              productId: p.productId,
              nombre: p.nombre || prod?.nombre || '',
              tipo: 'venta',
              cantidad: String(p.cantidad),
              precioUnitario: String(prod?.precio ?? 0),
            };
          })
        );
      }
      if (lineasEnvase.length === 0) {
        const envases =
          cliente?.saldosEnvase && cliente.saldosEnvase.length > 0
            ? cliente.saldosEnvase.map((s) => ({
                productId: s.productId,
                nombre: s.producto,
                tipo: 'devolucion' as const,
                cantidad: String(s.cantidadARecuperar > 0 ? s.cantidadARecuperar : s.saldo),
              }))
            : (cliente?.deudaEnvases || []).map((d) => ({
                productId: d.productId,
                nombre: d.producto,
                tipo: 'devolucion' as const,
                cantidad: String(d.cantidadARecuperar > 0 ? d.cantidadARecuperar : d.saldo),
              }));
        setLineasEnvase(envases);
      }
    } else {
      setLineasArticulo([]);
      setLineasEnvase([]);
    }
  }

  function elegirProducto(producto: ProductoCatalogo) {
    if (pickerFor === 'articulo') {
      const disp = stockDisponiblePorProducto.get(producto.productId) ?? 0;
      if (disp <= 0) {
        setFeedback({
          visible: true,
          type: 'warning',
          title: 'Sin stock disponible',
          message: `No hay stock disponible en el camión para "${producto.nombre}". Se agotó la cantidad cargada en el Control de Playa de salida.`,
        });
        return;
      }
      setLineasArticulo((prev) => {
        if (prev.some((l) => l.productId === producto.productId)) return prev;
        return [
          ...prev,
          {
            productId: producto.productId,
            nombre: producto.nombre,
            tipo: 'venta',
            cantidad: '1',
            precioUnitario: (producto.precio ?? 0).toString(),
          },
        ];
      });
    } else if (pickerFor === 'envase') {
      setLineasEnvase((prev) => {
        if (prev.some((l) => l.productId === producto.productId)) return prev;
        return [
          ...prev,
          { productId: producto.productId, nombre: producto.nombre, tipo: 'prestamo', cantidad: '1' },
        ];
      });
    }
    setPickerFor(null);
    setPickerQuery('');
  }

  function quitarArticulo(productId: number) {
    setLineasArticulo((prev) => prev.filter((l) => l.productId !== productId));
  }

  function quitarEnvase(productId: number) {
    setLineasEnvase((prev) => prev.filter((l) => l.productId !== productId));
  }

  function actualizarArticulo(productId: number, campo: 'cantidad' | 'precioUnitario', valor: string) {
    setLineasArticulo((prev) => prev.map((l) => (l.productId === productId ? { ...l, [campo]: valor } : l)));
  }

  function actualizarEnvase(productId: number, valor: string) {
    setLineasEnvase((prev) => prev.map((l) => (l.productId === productId ? { ...l, cantidad: valor } : l)));
  }

  function alternarTipoArticulo(productId: number) {
    setLineasArticulo((prev) =>
      prev.map((l) => (l.productId === productId ? { ...l, tipo: l.tipo === 'venta' ? 'devolucion' : 'venta' } : l)),
    );
  }

  function alternarTipoEnvase(productId: number) {
    setLineasEnvase((prev) =>
      prev.map((l) => (l.productId === productId ? { ...l, tipo: l.tipo === 'prestamo' ? 'devolucion' : 'prestamo' } : l)),
    );
  }

  async function handleGuardar() {
    if (!cliente) return;

    if (modo === 'transaccion') {
      const lineaInvalida = buscarLineaExcedida(lineasArticulo, stockDisponiblePorProducto);
      if (lineaInvalida) {
        const maxDisp = stockDisponiblePorProducto.get(lineaInvalida.productId) ?? 0;
        setFeedback({
          visible: true,
          type: 'error',
          title: 'Stock insuficiente',
          message: `No puedes asignar ${lineaInvalida.cantidad} unidades de "${lineaInvalida.nombre}". El stock disponible en camión es de ${maxDisp} unidades.`,
        });
        return;
      }
    }

    setSaving(true);
    setErrorMsg(null);
    try {
      // Network-first: se intenta el backend directamente (POST /insa/api/visita).
      // Si hay red, la respuesta del servidor actualiza el estado de la visita
      // de inmediato. Si no hay red, la operación queda en el outbox local y
      // se reintenta desde la pestaña Sincronizar (ver src/sync/).
      // En ambos casos mostramos el estado optimista de inmediato (onSaved).
      const visitadoOptimista =
        !(modo === 'sin_transaccion' && resultado === 'sin_gestion' && porWhatsapp);
      const parsedCobro = modo === 'transaccion' ? totalVentaArticulos : 0;

      await queuedWrites.registrarVisita({
        date: deliveryDate,
        partnerId: cliente.partnerId,
        resultado: modo === 'sin_transaccion' ? resultado ?? undefined : undefined,
        // Omitted unless the WhatsApp case applies — the backend already
        // defaults to true (RN-18: visita física salvo que se aclare lo
        // contrario).
        visitado: visitadoOptimista ? undefined : false,
        cobroEfectivo: parsedCobro,
        medioPago: modo === 'transaccion' && parsedCobro > 0 ? medioPago : 'sin_transaccion',
        referenciaPago:
          modo === 'transaccion' && parsedCobro > 0 && medioPago === 'transferencia'
            ? referenciaPago.trim() || undefined
            : undefined,
        lineasArticulo:
          modo === 'transaccion'
            ? lineasArticulo.map((l) => ({
                productId: l.productId,
                tipo: l.tipo,
                cantidad: Number(l.cantidad) || 0,
                precioUnitario: Number(l.precioUnitario) || 0,
              }))
            : [],
        lineasEnvase:
          modo === 'transaccion'
            ? lineasEnvase.map((l) => ({ productId: l.productId, tipo: l.tipo, cantidad: Number(l.cantidad) || 0 }))
            : [],
      });

      const nuevasLineasArticulo =
        modo === 'transaccion'
          ? lineasArticulo.map((l) => ({
              productId: l.productId,
              nombre: l.nombre,
              tipo: l.tipo,
              cantidad: Number(l.cantidad) || 0,
              precioUnitario: Number(l.precioUnitario) || 0,
            }))
          : [];
      const nuevasLineasEnvase =
        modo === 'transaccion'
          ? lineasEnvase.map((l) => ({
              productId: l.productId,
              nombre: l.nombre,
              tipo: l.tipo,
              cantidad: Number(l.cantidad) || 0,
            }))
          : [];
      const nuevoMontoVenta = nuevasLineasArticulo
        .filter((l) => l.tipo === 'venta')
        .reduce((sum, l) => sum + l.cantidad * l.precioUnitario, 0);

      const updatedCliente: ClienteVisita = {
        ...cliente,
        visitado: visitadoOptimista,
        resultado: modo === 'sin_transaccion' ? resultado : null,
        cobroEfectivo: parsedCobro,
        medioPago: modo === 'transaccion' && parsedCobro > 0 ? medioPago : 'sin_transaccion',
        referenciaPago:
          modo === 'transaccion' && parsedCobro > 0 && medioPago === 'transferencia'
            ? referenciaPago.trim() || undefined
            : undefined,
        lineasArticulo: nuevasLineasArticulo,
        lineasEnvase: nuevasLineasEnvase,
        consumos: (cliente.consumos || 0) + nuevoMontoVenta,
      };

      setSavedCliente(updatedCliente);
      // Sincronizar estado global inmediatamente en toda la app (Stock en ruta, Hoja de ruta, Control de playa)
      void queryClient.invalidateQueries({ queryKey: ['reparto'] });
      setFeedback({
        visible: true,
        type: 'success',
        title: '¡Visita Registrada!',
        message: `La visita para ${cliente.nombre} se guardó exitosamente.`,
        autoCloseMs: 1600,
      });
    } catch (err) {
      const msg = err instanceof RepartoApiError ? err.message : 'No se pudo guardar la visita.';
      setErrorMsg(msg);
      setFeedback({
        visible: true,
        type: 'error',
        title: 'Error al registrar',
        message: msg,
      });
    } finally {
      setSaving(false);
    }
  }

  const puedeGuardar =
    modo === 'sin_transaccion'
      ? resultado !== null
      : (lineasArticulo.length > 0 || lineasEnvase.length > 0) && !lineasExcedidas;

  // Picker view (product search) swaps in for the main body while active —
  // same pattern as ControlDePlayaDialog, no nested modal.
  if (visible && pickerFor) {
    return (
      <Dialog
        visible={visible}
        onClose={() => setPickerFor(null)}
        header={
          <View style={styles.pickerHeader}>
            <IconButton icon="arrow-back" onPress={() => setPickerFor(null)} color={colors.onSurface} />
            <Text style={styles.pickerTitle}>{pickerFor === 'envase' ? 'Elegir envase' : 'Elegir artículo'}</Text>
          </View>
        }
      >
        <SearchBar value={pickerQuery} onChangeText={setPickerQuery} placeholder="Buscar..." />
        <View style={styles.pickerList}>
          {productosFiltrados.map((p) => {
            const disp = pickerFor === 'articulo' ? (stockDisponiblePorProducto.get(p.productId) ?? 0) : null;
            const isOutOfStock = pickerFor === 'articulo' && disp !== null && disp <= 0;
            return (
              <ListItem
                key={p.productId}
                title={p.nombre}
                subtitle={
                  pickerFor === 'articulo'
                    ? isOutOfStock
                      ? '⚠️ Agotado en camión (0 disponibles)'
                      : `Stock en camión: ${disp} unid.`
                    : undefined
                }
                onPress={() => elegirProducto(p)}
              />
            );
          })}
          {productosFiltrados.length === 0 ? (
            <Text style={styles.emptyText}>
              {pickerFor === 'articulo' && !salidaAprobada
                ? 'El Control de Playa de salida aún no fue aprobado. Debes aprobarlo para poder agregar artículos.'
                : 'Sin resultados.'}
            </Text>
          ) : null}
        </View>
      </Dialog>
    );
  }

  return (
    <Dialog
      visible={visible}
      onClose={onClose}
      title={
        cliente
          ? readOnly
            ? `Consulta de cliente — ${cliente.nombre}`
            : `Registrar visita — ${cliente.nombre}`
          : 'Registrar visita'
      }
      footer={
        readOnly ? (
          <Button title="Cerrar" variant="secondary" onPress={onClose} style={styles.footerButton} fullWidth />
        ) : (
          <>
            <Button title="Cancelar" variant="secondary" onPress={onClose} style={styles.footerButton} />
            <Button
              title="Guardar"
              variant="primary"
              onPress={handleGuardar}
              loading={saving}
              disabled={!puedeGuardar}
              style={styles.footerButton}
            />
          </>
        )
      }
    >
      {readOnly ? (
        <View style={styles.readOnlyNotice}>
          <Text style={styles.readOnlyNoticeText}>
            Modo solo lectura: No se pueden registrar visitas para fechas anteriores.
          </Text>
        </View>
      ) : null}

      <View style={styles.modoRow}>
        <Pressable
          style={[styles.modoChip, modo === 'sin_transaccion' && styles.modoChipActive]}
          onPress={() => cambiarModo('sin_transaccion')}
        >
          <Text style={[styles.modoChipText, modo === 'sin_transaccion' && styles.modoChipTextActive]}>
            Sin transacción
          </Text>
        </Pressable>
        <Pressable
          style={[styles.modoChip, modo === 'transaccion' && styles.modoChipActive]}
          onPress={() => cambiarModo('transaccion')}
        >
          <Text style={[styles.modoChipText, modo === 'transaccion' && styles.modoChipTextActive]}>
            Con transacción
          </Text>
        </Pressable>
      </View>

      {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

      {modo === 'sin_transaccion' ? (
        <View>
          <View style={styles.resultadoRow}>
            <Button
              title="☕ Ausente"
              variant={resultado === 'ausente' ? 'primary' : 'secondary'}
              onPress={() => setResultado('ausente')}
              style={styles.resultadoButton}
            />
            <Button
              title="❗ Sin gestión"
              variant={resultado === 'sin_gestion' ? 'primary' : 'secondary'}
              onPress={() => setResultado('sin_gestion')}
              style={styles.resultadoButton}
            />
          </View>
          {resultado === 'sin_gestion' ? (
            <Pressable style={styles.whatsappRow} onPress={() => setPorWhatsapp((v) => !v)}>
              <IconButton
                icon={porWhatsapp ? 'check-box' : 'check-box-outline-blank'}
                color={colors.primary}
                onPress={() => setPorWhatsapp((v) => !v)}
              />
              <Text style={styles.whatsappText}>Resuelto por WhatsApp, sin ir al domicilio</Text>
            </Pressable>
          ) : null}
        </View>
      ) : (
        <View>
          <Text style={styles.sectionLabel}>Artículos</Text>
          {!salidaAprobada ? (
            <View style={styles.salidaWarningBanner}>
              <MaterialIcons name="warning-amber" size={18} color={colors.warning} />
              <Text style={styles.salidaWarningText}>
                Control de salida pendiente de aprobación. Solo se pueden agregar artículos aprobados en la salida.
              </Text>
            </View>
          ) : null}

          <Button
            title="+ Agregar artículo"
            variant="primary"
            fullWidth
            onPress={() => setPickerFor('articulo')}
            disabled={loadingCatalogo || loadingControlPlaya || !salidaAprobada}
            style={styles.addButton}
          />

          {lineasArticulo.length > 0 ? (
            <View style={styles.lineasList}>
              {lineasArticulo.map((linea) => {
                const cant = Number(linea.cantidad) || 0;
                const pu = Number(linea.precioUnitario) || 0;
                const subtotal = cant * pu;
                const maxDisp = stockDisponiblePorProducto.get(linea.productId) ?? 0;
                const stockExcedido = linea.tipo === 'venta' && (cant > maxDisp || cant <= 0);

                const cantOriginal = pedidoOriginalMap.get(linea.productId);
                const esExtraTotal = cantOriginal === undefined;
                const esExtraParcial = cantOriginal !== undefined && cant > cantOriginal;
                const cantExtra = esExtraParcial ? cant - cantOriginal : (esExtraTotal ? cant : 0);

                return (
                  <View
                    key={linea.productId}
                    style={[
                      styles.lineaCard,
                      stockExcedido && styles.lineaCardError,
                      (esExtraTotal || esExtraParcial) && styles.lineaCardExtra,
                    ]}
                  >
                    <View style={styles.lineaCardHeader}>
                      <View style={{ flex: 1 }}>
                        <View style={styles.lineaNombreRow}>
                          <Text style={styles.lineaNombre} numberOfLines={1}>
                            {linea.nombre}
                          </Text>
                          {esExtraTotal ? (
                            <Badge label="Pedido Extra" variant="secondary" size="sm" />
                          ) : esExtraParcial ? (
                            <Badge label={`Extra (+${cantExtra})`} variant="secondary" size="sm" />
                          ) : null}
                        </View>
                        {cantOriginal !== undefined ? (
                          <Text style={styles.pedidoOriginalInfo}>
                            Pedido habitual: {cantOriginal} unid.{esExtraParcial ? ` · Supera en +${cantExtra}` : ''}
                          </Text>
                        ) : (
                          <Text style={styles.pedidoExtraInfo}>
                            Artículo no incluido en el pedido habitual
                          </Text>
                        )}
                        {linea.tipo === 'venta' ? (
                          <Text
                            style={[
                              styles.stockDisponibleText,
                              cant > maxDisp && styles.stockDisponibleTextError,
                            ]}
                          >
                            Stock en camión: {maxDisp} unid.
                          </Text>
                        ) : null}
                      </View>
                      <View style={styles.chipCloseRow}>
                        <Pressable
                          style={[styles.tipoChip, linea.tipo === 'devolucion' && styles.tipoChipDevolucion]}
                          onPress={() => alternarTipoArticulo(linea.productId)}
                        >
                          <Text style={styles.tipoChipText}>{linea.tipo === 'venta' ? 'Venta' : 'Devolución'}</Text>
                        </Pressable>
                        <IconButton icon="close" onPress={() => quitarArticulo(linea.productId)} color={colors.error} />
                      </View>
                    </View>
                    <View style={styles.inputsRow}>
                      <TextField
                        label="Cantidad"
                        value={linea.cantidad}
                        onChangeText={(v) => actualizarArticulo(linea.productId, 'cantidad', v)}
                        keyboardType="numeric"
                        error={
                          linea.tipo === 'venta' && cant > maxDisp
                            ? `Supera el stock disponible (${maxDisp} máx.)`
                            : undefined
                        }
                        containerStyle={styles.inputItem}
                      />
                      <TextField
                        label="Precio unitario"
                        value={formatPrecio(linea.precioUnitario)}
                        editable={false}
                        leftIcon="attach-money"
                        containerStyle={styles.inputItem}
                      />
                    </View>
                    {linea.tipo === 'venta' && cant > 0 ? (
                      <View style={styles.subtotalRow}>
                        <Text style={styles.subtotalLabel}>Subtotal:</Text>
                        <Text style={styles.subtotalValue}>${formatPrecio(subtotal)}</Text>
                      </View>
                    ) : null}
                  </View>
                );
              })}
              {totalVentaArticulos > 0 ? (
                <View style={styles.totalArticulosRow}>
                  <Text style={styles.totalArticulosLabel}>Total estimado artículos:</Text>
                  <Text style={styles.totalArticulosValue}>${formatPrecio(totalVentaArticulos)}</Text>
                </View>
              ) : null}
            </View>
          ) : null}

          <Text style={styles.sectionLabel}>Envases (préstamo / devolución)</Text>
          <Button
            title="+ Agregar envase"
            variant="primary"
            fullWidth
            onPress={() => setPickerFor('envase')}
            disabled={loadingCatalogo}
            style={styles.addButton}
          />

          {lineasEnvase.length > 0 ? (
            <View style={styles.lineasList}>
              {lineasEnvase.map((linea) => {
                const saldoInfo =
                  cliente?.saldosEnvase?.find((s) => s.productId === linea.productId) ||
                  cliente?.deudaEnvases?.find((d) => d.productId === linea.productId);

                return (
                  <View key={linea.productId} style={styles.lineaCard}>
                    <View style={styles.lineaCardHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.lineaNombre} numberOfLines={1}>
                          {linea.nombre}
                        </Text>
                        {saldoInfo ? (
                          <Text style={styles.envaseSaldoInfo}>
                            Saldo: {saldoInfo.saldo} | A recuperar: {saldoInfo.cantidadARecuperar}
                            {'estadoSaldo' in saldoInfo && saldoInfo.estadoSaldo
                              ? ` · Estado: ${saldoInfo.estadoSaldo}`
                              : ''}
                          </Text>
                        ) : null}
                      </View>
                      <View style={styles.chipCloseRow}>
                        <Pressable
                          style={[styles.tipoChip, linea.tipo === 'devolucion' && styles.tipoChipDevolucion]}
                          onPress={() => alternarTipoEnvase(linea.productId)}
                        >
                          <Text style={styles.tipoChipText}>{linea.tipo === 'prestamo' ? 'Préstamo' : 'Devolución'}</Text>
                        </Pressable>
                        <IconButton icon="close" onPress={() => quitarEnvase(linea.productId)} color={colors.error} />
                      </View>
                    </View>
                    <View style={styles.inputsRow}>
                      <TextField
                        label="Cantidad (no editable)"
                        value={linea.cantidad}
                        editable={false}
                        keyboardType="numeric"
                        containerStyle={styles.inputItem}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          ) : null}

          {totalVentaArticulos > 0 ? (
            <View style={styles.medioPagoContainer}>
              <Text style={styles.sectionLabel}>Medio de pago *</Text>
              <View style={styles.segmentedContainer}>
                <Pressable
                  style={[styles.segmentBtn, medioPago === 'efectivo' && styles.segmentBtnActive]}
                  onPress={() => setMedioPago('efectivo')}
                >
                  <MaterialIcons
                    name="payments"
                    size={20}
                    color={medioPago === 'efectivo' ? colors.onPrimary : colors.onSurfaceVariant}
                  />
                  <Text style={[styles.segmentBtnText, medioPago === 'efectivo' && styles.segmentBtnTextActive]}>
                    Efectivo
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.segmentBtn, medioPago === 'transferencia' && styles.segmentBtnActive]}
                  onPress={() => setMedioPago('transferencia')}
                >
                  <MaterialIcons
                    name="account-balance"
                    size={20}
                    color={medioPago === 'transferencia' ? colors.onPrimary : colors.onSurfaceVariant}
                  />
                  <Text style={[styles.segmentBtnText, medioPago === 'transferencia' && styles.segmentBtnTextActive]}>
                    Transferencia
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : null}
        </View>
      )}

      {/* Modal de Feedback (Éxito / Error / Alerta) */}
      {feedback ? (
        <FeedbackDialog
          visible={feedback.visible}
          type={feedback.type}
          title={feedback.title}
          message={feedback.message}
          autoCloseMs={feedback.autoCloseMs}
          onClose={() => {
            const isSuccess = feedback.type === 'success';
            setFeedback(null);
            if (isSuccess && savedCliente) {
              onSaved(savedCliente);
              onClose();
            }
          }}
          onConfirm={() => {
            const isSuccess = feedback.type === 'success';
            setFeedback(null);
            if (isSuccess && savedCliente) {
              onSaved(savedCliente);
              onClose();
            }
          }}
        />
      ) : null}
    </Dialog>
  );
}

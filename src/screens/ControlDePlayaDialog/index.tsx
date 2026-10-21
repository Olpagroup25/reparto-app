import { useEffect, useMemo, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Dialog,
  FeedbackDialog,
  IconButton,
  ListItem,
  RadioButton,
  SearchBar,
  Tabs,
  TextField,
} from '@/components';
import { colors } from '@/theme/tokens';
import { repartoApiClient, RepartoApiError } from '@/api/repartoApiClient';
import { useCatalogo } from '@/hooks/useCatalogos';
import { useHojaDeRuta } from '@/hooks/useHojaDeRuta';
import { useStockEnRuta } from '@/hooks/useStockEnRuta';
import { queuedWrites } from '@/sync/queuedWrites';
import type { ControlPlaya, ProductoCatalogo } from '@/api/types';
import { styles } from './styles';
import type { ControlDePlayaDialogProps, FeedbackState, FlowType, LineaEditable, TabKey } from './types';
import {
  buildSaveControlPlayaPayload,
  calculateKmDiff,
  calculateSalidaTotalLlenos,
  filterCatalogoProducts,
  formatPrecio,
  isSalidaBloqueada,
  mapControlPlayaLineasToEditable,
  mapSalidaToEntradaEditable,
  TABS,
  validateSalidaLineas,
} from './utils';

export type { ControlDePlayaDialogProps, FeedbackState, FlowType, LineaEditable, TabItem, TabKey } from './types';

/**
 * Dialog del Control de Playa (salida / entrada).
 */
export function ControlDePlayaDialog({
  visible,
  onClose,
  deliveryDate,
  onApproved,
  onSaved,
}: ControlDePlayaDialogProps) {
  const [flowType, setFlowType] = useState<FlowType>('salida');
  const [km, setKm] = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('articulos');

  // Cached + persisted for offline use (see src/hooks/useCatalogos.ts).
  const { data: catalogo = [], isError: catalogoError } = useCatalogo();
  const { data: stockEnRuta = [] } = useStockEnRuta(deliveryDate);
  const { data: hojaDeRuta } = useHojaDeRuta(deliveryDate);
  const [lineas, setLineas] = useState<LineaEditable[]>([]);
  // The saved insa.control.playa for salida
  const [controlSalida, setControlSalida] = useState<ControlPlaya | null>(null);
  const [controlActual, setControlActual] = useState<ControlPlaya | null>(null);
  const [totalRecaudadoServer, setTotalRecaudadoServer] = useState<number | null>(null);

  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerQuery, setPickerQuery] = useState('');

  const [approvalModalVisible, setApprovalModalVisible] = useState(false);
  const [approvalLogin, setApprovalLogin] = useState('');
  const [approvalPassword, setApprovalPassword] = useState('');
  const [showApprovalPassword, setShowApprovalPassword] = useState(false);
  const [approvalSaving, setApprovalSaving] = useState(false);
  const [approvalError, setApprovalError] = useState<string | null>(null);

  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const activeTabInfo = TABS.find((tab) => tab.key === activeTab)!;
  const queryClient = useQueryClient();

  // Reset transient UI state on close so reopening doesn't flash it.
  useEffect(() => {
    if (!visible) {
      setPickerVisible(false);
      setPickerQuery('');
      setErrorMsg(null);
      setApprovalModalVisible(false);
      setApprovalLogin('');
      setApprovalPassword('');
      setShowApprovalPassword(false);
      setApprovalError(null);
      setFeedback(null);
    }
  }, [visible]);

  // Load both salida and entrada for this delivery date
  useEffect(() => {
    if (!visible) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErrorMsg(null);
      try {
        const controlPlaya = await repartoApiClient.getControlPlaya(deliveryDate);
        if (cancelled) return;

        setControlSalida(controlPlaya.salida);
        setTotalRecaudadoServer(controlPlaya.totalRecaudado ?? null);

        const existente = flowType === 'salida' ? controlPlaya.salida : controlPlaya.entrada;
        setControlActual(existente);
        setKm(existente ? String(existente.kilometros) : '');

        if (existente && existente.lineas.length > 0) {
          setLineas(mapControlPlayaLineasToEditable(existente.lineas));
        } else if (flowType === 'entrada' && controlPlaya.salida && controlPlaya.salida.lineas.length > 0) {
          // Preload products from Salida into Entrada
          setLineas(mapSalidaToEntradaEditable(controlPlaya.salida.lineas));
        } else {
          setLineas([]);
        }
      } catch (err) {
        if (!cancelled) {
          setErrorMsg(err instanceof RepartoApiError ? err.message : 'No se pudo cargar Control de Playa.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [visible, flowType, deliveryDate]);

  useEffect(() => {
    if (catalogoError) setErrorMsg('No se pudo cargar el catálogo de artículos.');
  }, [catalogoError]);

  const productosFiltrados = useMemo(() => {
    return filterCatalogoProducts(catalogo, pickerQuery);
  }, [catalogo, pickerQuery]);

  function agregarLinea(producto: ProductoCatalogo) {
    setLineas((prev) => {
      if (prev.some((l) => l.productId === producto.productId)) return prev;
      return [
        ...prev,
        {
          productId: producto.productId,
          nombre: producto.nombre,
          cantidad: '1',
          cantidadVacia: '0',
          cantidadFallada: '0',
          aCargar: 0,
        },
      ];
    });
    setPickerVisible(false);
    setPickerQuery('');
  }

  function quitarLinea(productId: number) {
    setLineas((prev) => prev.filter((l) => l.productId !== productId));
  }

  function actualizarCantidad(
    productId: number,
    campo: 'cantidad' | 'cantidadVacia' | 'cantidadFallada',
    valor: string,
  ) {
    setLineas((prev) => prev.map((l) => (l.productId === productId ? { ...l, [campo]: valor } : l)));
  }

  const clientesRuta = hojaDeRuta?.clientes ?? [];
  const totalRecaudadoClientes = useMemo(() => {
    return clientesRuta.reduce((acc, c) => acc + (c.cobroEfectivo || 0), 0);
  }, [clientesRuta]);

  const totalEfectivoClientes = useMemo(() => {
    return clientesRuta
      .filter((c) => c.medioPago === 'efectivo' || !c.medioPago)
      .reduce((acc, c) => acc + (c.cobroEfectivo || 0), 0);
  }, [clientesRuta]);

  const totalTransferenciaClientes = useMemo(() => {
    return clientesRuta
      .filter((c) => c.medioPago === 'transferencia')
      .reduce((acc, c) => acc + (c.cobroEfectivo || 0), 0);
  }, [clientesRuta]);

  const totalRecaudado = totalRecaudadoServer ?? totalRecaudadoClientes;

  const isBloqueado = Boolean(controlActual?.aprobado || controlActual?.state === 'confirmado');
  const salidaBloqueada = flowType === 'salida' ? isBloqueado : isSalidaBloqueada(controlSalida);

  async function handleGuardar() {
    if (isBloqueado) return;

    if (flowType === 'salida') {
      const validation = validateSalidaLineas(lineas);
      if (!validation.valid) {
        setErrorMsg(validation.error!);
        setFeedback({
          visible: true,
          type: 'error',
          title: 'Validación de carga',
          message: validation.error!,
        });
        return;
      }
    }

    setSaving(true);
    setErrorMsg(null);
    try {
      const payload = buildSaveControlPlayaPayload(deliveryDate, flowType, km, lineas);
      await queuedWrites.saveControlPlaya(payload);

      // Refrescar inmediatamente el estado en React Query
      await queryClient.invalidateQueries({ queryKey: ['reparto', 'control-playa', deliveryDate] });
      await queryClient.invalidateQueries({ queryKey: ['reparto', 'stock-en-ruta', deliveryDate] });
      await queryClient.invalidateQueries({ queryKey: ['reparto', 'hoja-de-ruta', deliveryDate] });
      onSaved?.();

      setFeedback({
        visible: true,
        type: 'success',
        title: 'Guardado correctamente',
        message: `El Control de ${flowType === 'salida' ? 'Salida' : 'Entrada'} se ha guardado exitosamente.`,
        autoCloseMs: 1600,
      });
    } catch (err) {
      const msg = err instanceof RepartoApiError ? err.message : 'No se pudo guardar Control de Playa.';
      setErrorMsg(msg);
      setFeedback({
        visible: true,
        type: 'error',
        title: 'Error al guardar',
        message: msg,
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleAprobar() {
    if (!approvalLogin.trim() || !approvalPassword) {
      setApprovalError('Ingresá usuario y contraseña.');
      return;
    }
    setApprovalSaving(true);
    setApprovalError(null);
    try {
      const actualizado = await repartoApiClient.aprobarControlPlaya(
        deliveryDate,
        flowType,
        approvalLogin.trim(),
        approvalPassword,
      );
      setControlActual(actualizado);
      if (flowType === 'salida') setControlSalida(actualizado);

      await queryClient.invalidateQueries({ queryKey: ['reparto', 'control-playa', deliveryDate] });
      await queryClient.invalidateQueries({ queryKey: ['reparto', 'stock-en-ruta', deliveryDate] });
      await queryClient.invalidateQueries({ queryKey: ['reparto', 'hoja-de-ruta', deliveryDate] });
      onApproved?.();

      setApprovalModalVisible(false);
      setApprovalLogin('');
      setApprovalPassword('');

      setFeedback({
        visible: true,
        type: 'success',
        title: '¡Control Aprobado!',
        message: `El Control de ${flowType === 'salida' ? 'Salida' : 'Entrada'} ha sido aprobado con éxito por ${actualizado.aprobadoPor || 'el controlador'}.`,
        autoCloseMs: 2200,
      });
    } catch (err) {
      const msg = err instanceof RepartoApiError ? err.message : 'No se pudo aprobar el Control de Playa.';
      setApprovalError(msg);
    } finally {
      setApprovalSaving(false);
    }
  }

  const kmDiff = controlSalida ? calculateKmDiff(km, controlSalida.kilometros) : null;

  // Picker view (product search) swaps in for the main body while active
  if (visible && pickerVisible) {
    return (
      <Dialog
        visible={visible}
        onClose={() => setPickerVisible(false)}
        header={
          <View style={styles.pickerHeader}>
            <IconButton icon="arrow-back" onPress={() => setPickerVisible(false)} color={colors.onSurface} />
            <Text style={styles.pickerTitle}>Elegir artículo</Text>
          </View>
        }
      >
        <SearchBar value={pickerQuery} onChangeText={setPickerQuery} placeholder="Buscar artículo..." />
        <View style={styles.pickerList}>
          {productosFiltrados.map((p) => (
            <ListItem key={p.productId} title={p.nombre} onPress={() => agregarLinea(p)} />
          ))}
          {productosFiltrados.length === 0 ? <Text style={styles.emptyText}>Sin resultados.</Text> : null}
        </View>
      </Dialog>
    );
  }

  return (
    <Dialog
      visible={visible}
      onClose={onClose}
      header={
        <View style={styles.header}>
          <View style={styles.headerIconContainer}>
            <FontAwesome5 name="truck-loading" size={18} color={colors.primary} />
          </View>
          <Text style={styles.headerTitle}>Control De Playa</Text>
        </View>
      }
      footer={
        <>
          <Button title="Cancelar" variant="secondary" onPress={onClose} style={styles.footerButton} />
          <Button
            title={isBloqueado ? `${flowType === 'salida' ? 'Salida' : 'Entrada'} Bloqueada` : 'Guardar'}
            variant="primary"
            onPress={handleGuardar}
            loading={saving}
            disabled={loading || isBloqueado}
            style={styles.footerButton}
          />
        </>
      }
    >
      <View style={styles.radioRow}>
        <RadioButton label="Salida" selected={flowType === 'salida'} onPress={() => setFlowType('salida')} />
        <RadioButton label="Entrada" selected={flowType === 'entrada'} onPress={() => setFlowType('entrada')} />
      </View>

      {/* Banner de Control Bloqueado para edición */}
      {isBloqueado ? (
        <View style={styles.salidaLockedBanner}>
          <MaterialIcons name="lock" size={20} color="#1B5E20" />
          <Text style={styles.salidaLockedBannerText}>
            Control de {flowType === 'salida' ? 'Salida' : 'Entrada'} confirmado y aprobado. Los datos han quedado como solo lectura (no modificables).
          </Text>
        </View>
      ) : null}

      {/* Tarjeta de Salida informativa (solo en Entrada) */}
      {flowType === 'entrada' ? (
        !controlSalida ? (
          <View style={styles.salidaWarningBanner}>
            <MaterialIcons name="warning-amber" size={20} color={colors.warning} />
            <Text style={styles.salidaWarningText}>
              Sin Salida registrada para el {deliveryDate}.
            </Text>
          </View>
        ) : (
          <View style={styles.salidaInfoCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <FontAwesome5 name="clipboard-check" size={13} color={colors.primary} />
              <Text style={styles.salidaInfoTitle}>Salida:</Text>
              <Text style={styles.salidaInfoKm}>{controlSalida.kilometros} km</Text>
            </View>
            <Text style={styles.salidaInfoSummaryText}>
              {calculateSalidaTotalLlenos(controlSalida.lineas)} llenos cargados ({controlSalida.lineas.length} art.)
            </Text>
          </View>
        )
      ) : null}

      {/* Tarjeta de Total Recaudado (solo en Entrada) */}
      {flowType === 'entrada' ? (
        <View style={styles.recaudacionInfoCard}>
          <View style={styles.recaudacionHeader}>
            <View style={styles.recaudacionTitleContainer}>
              <FontAwesome5 name="money-bill-wave" size={13} color="#2E7D32" />
              <Text style={styles.recaudacionTitle}>Total Recaudado en Hoja de Ruta:</Text>
            </View>
            <Text style={styles.recaudacionMonto}>${formatPrecio(totalRecaudado)}</Text>
          </View>
          {totalEfectivoClientes > 0 && totalTransferenciaClientes > 0 ? (
            <View style={styles.recaudacionBreakdown}>
              <Text style={styles.recaudacionSubtext}>Efectivo: ${formatPrecio(totalEfectivoClientes)}</Text>
              <Text style={styles.recaudacionSubtext}>•</Text>
              <Text style={styles.recaudacionSubtext}>Transferencia: ${formatPrecio(totalTransferenciaClientes)}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {/* Tarjeta armonizada de Aprobación */}
      {controlActual ? (
        controlActual.aprobado ? (
          <View style={styles.approvedCard}>
            <MaterialIcons name="verified" size={20} color="#2E7D32" />
            <View style={styles.approvedCardTextContainer}>
              <Text style={styles.approvedCardTitle}>Control Aprobado</Text>
              <Text style={styles.approvedCardSubtitle}>
                Aprobado por {controlActual.aprobadoPor || 'repartidor'}
                {controlActual.aprobadoFecha
                  ? ` • ${controlActual.aprobadoFecha.slice(0, 16).replace('T', ' ')}`
                  : ''}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.pendingApprovalCard}>
            <View style={styles.pendingApprovalInfo}>
              <MaterialIcons name="lock-clock" size={20} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.pendingApprovalTitle}>Control en Borrador</Text>
                <Text style={styles.pendingApprovalSubtitle}>Pendiente de aprobación</Text>
              </View>
            </View>
            <Button
              title="Aprobar"
              variant="primary"
              onPress={() => {
                if (flowType === 'salida') {
                  const validation = validateSalidaLineas(lineas);
                  if (!validation.valid) {
                    setErrorMsg(validation.error!);
                    setFeedback({
                      visible: true,
                      type: 'error',
                      title: 'Validación de carga',
                      message: validation.error!,
                    });
                    return;
                  }
                }
                setApprovalLogin('');
                setApprovalPassword('');
                setShowApprovalPassword(false);
                setApprovalError(null);
                setApprovalModalVisible(true);
              }}
              loading={approvalSaving}
              disabled={loading || saving}
            />
          </View>
        )
      ) : null}

      <TextField
        label="Kilometros"
        value={km}
        onChangeText={setKm}
        placeholder="Ingrese km"
        keyboardType="numeric"
        editable={!isBloqueado}
        containerStyle={styles.spaced}
      />

      {flowType === 'entrada' && controlSalida && km !== '' && kmDiff ? (
        <View style={styles.kmDiffContainer}>
          {!kmDiff.isLess ? (
            <Text style={styles.kmDiffSuccess}>
              Recorrido del día: +{kmDiff.diff} km
            </Text>
          ) : (
            <Text style={styles.kmDiffWarning}>
              ⚠️ El km de entrada ({km}) es menor al de salida ({controlSalida.kilometros})
            </Text>
          )}
        </View>
      ) : null}

      {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

      <Tabs
        tabs={TABS.map((tab) => ({
          key: tab.key,
          label: tab.label,
          badgeCount: tab.key === 'articulos' ? lineas.length : 0,
        }))}
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as TabKey)}
      />

      {activeTab === 'articulos' ? (
        <>
          {flowType === 'salida' && !isBloqueado ? (
            <Button
              title={activeTabInfo.addLabel}
              variant="primary"
              fullWidth
              onPress={() => setPickerVisible(true)}
              disabled={loading}
              style={styles.addButton}
            />
          ) : null}

          {lineas.length === 0 ? (
            <View style={styles.emptyList}>
              <Text style={styles.emptyText}>No hay artículos cargados.</Text>
            </View>
          ) : (
            <View style={styles.lineasList}>
              {lineas.map((linea) => {
                const salidaLinea = controlSalida?.lineas.find((sl) => sl.productId === linea.productId);
                const stockItem = stockEnRuta.find((s) => s.productId === linea.productId);
                const salioCant = salidaLinea ? salidaLinea.cantidad : 0;
                const dispCant = stockItem ? stockItem.disponibles : salioCant;
                const vaciosCant = stockItem ? stockItem.vacios : 0;
                const falladosCant = stockItem ? stockItem.fallados : 0;

                if (flowType === 'entrada') {
                  const esBidon =
                    linea.nombre.toLowerCase().includes('bidon') ||
                    linea.nombre.toLowerCase().includes('bidón');
                  const conceptoLlenos = esBidon ? 'Bidones Llenos' : 'Artículos Llenos';

                  return (
                    <View key={linea.productId} style={styles.tableCard}>
                      {/* Cabecera del producto */}
                      <View style={styles.tableCardHeader}>
                        <Text style={styles.tableCardHeaderTitle} numberOfLines={1}>
                          {linea.nombre.toUpperCase()}
                        </Text>
                      </View>

                      {/* Encabezado de columnas */}
                      <View style={styles.tableHeaderRow}>
                        <View style={styles.tableHeaderCellConcept} />
                        <Text style={styles.tableHeaderCellStock}>Stock en Ruta</Text>
                        <Text style={styles.tableHeaderCellInput}>Entrada</Text>
                      </View>

                      {/* Fila 1: Llenos */}
                      <View style={styles.tableRow}>
                        <View style={styles.tableCellConcept}>
                          <Text style={styles.tableConceptTitle}>{conceptoLlenos}</Text>
                          <Text style={styles.tableConceptSubtitle}>
                            {salidaLinea ? `Salió: ${salioCant} un.` : 'Total en camión'}
                          </Text>
                        </View>
                        <View style={styles.tableCellStock}>
                          <Text style={styles.tableStockText}>{dispCant} un.</Text>
                        </View>
                        <View style={styles.tableCellInput}>
                          <TextInput
                            value={linea.cantidad}
                            onChangeText={(v) => actualizarCantidad(linea.productId, 'cantidad', v)}
                            keyboardType="numeric"
                            editable={!isBloqueado}
                            style={[styles.tableInput, isBloqueado && styles.tableInputDisabled]}
                          />
                        </View>
                      </View>

                      {/* Fila 2: Envases Retorno (Vacíos) */}
                      <View style={styles.tableRow}>
                        <View style={styles.tableCellConcept}>
                          <Text style={styles.tableConceptTitle}>Envases Retorno</Text>
                          <Text style={styles.tableConceptSubtitle}>Vacíos recolectados</Text>
                        </View>
                        <View style={styles.tableCellStock}>
                          <Text style={styles.tableStockText}>{vaciosCant} un.</Text>
                        </View>
                        <View style={styles.tableCellInput}>
                          <TextInput
                            value={linea.cantidadVacia}
                            onChangeText={(v) => actualizarCantidad(linea.productId, 'cantidadVacia', v)}
                            keyboardType="numeric"
                            editable={!isBloqueado}
                            style={[styles.tableInput, isBloqueado && styles.tableInputDisabled]}
                          />
                        </View>
                      </View>

                      {/* Fila 3: Roturas / Fallas */}
                      <View style={[styles.tableRow, styles.tableRowLast]}>
                        <View style={styles.tableCellConcept}>
                          <Text style={styles.tableConceptTitle}>Roturas / Fallas</Text>
                          <Text style={styles.tableConceptSubtitle}>Fallas detectadas</Text>
                        </View>
                        <View style={styles.tableCellStock}>
                          <Text style={styles.tableStockText}>{falladosCant} un.</Text>
                        </View>
                        <View style={styles.tableCellInput}>
                          <TextInput
                            value={linea.cantidadFallada}
                            onChangeText={(v) => actualizarCantidad(linea.productId, 'cantidadFallada', v)}
                            keyboardType="numeric"
                            editable={!isBloqueado}
                            style={[styles.tableInput, isBloqueado && styles.tableInputDisabled]}
                          />
                        </View>
                      </View>
                    </View>
                  );
                }

                // flowType === 'salida'
                const aCargar = linea.aCargar ?? 0;
                const llenosVal = Number(linea.cantidad);
                const hasError = !isBloqueado && (isNaN(llenosVal) || llenosVal < aCargar);

                return (
                  <View key={linea.productId} style={styles.lineaCard}>
                    <View style={styles.lineaCardHeader}>
                      <Text style={styles.lineaNombre}>{linea.nombre}</Text>
                      {!isBloqueado ? (
                        <IconButton
                          icon="close"
                          onPress={() => quitarLinea(linea.productId)}
                          color={colors.error}
                        />
                      ) : null}
                    </View>
                    <View style={styles.inputsRow}>
                      <TextField
                        label="A cargar"
                        value={String(aCargar)}
                        editable={false}
                        containerStyle={styles.inputItem}
                      />
                      <TextField
                        label="Llenos"
                        value={linea.cantidad}
                        onChangeText={(v) => actualizarCantidad(linea.productId, 'cantidad', v)}
                        keyboardType="numeric"
                        editable={!isBloqueado}
                        error={hasError ? `Mínimo: ${aCargar}` : undefined}
                        containerStyle={styles.inputItem}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </>
      ) : (
        <View style={styles.emptyList}>
          <Text style={styles.emptyText}>{activeTabInfo.label} no disponible en esta versión.</Text>
        </View>
      )}

      {/* Modal de Ingreso de Credenciales para Aprobación (2do Factor) */}
      <Dialog
        visible={approvalModalVisible}
        onClose={() => setApprovalModalVisible(false)}
        title={`Aprobar Control de ${flowType === 'salida' ? 'Salida' : 'Entrada'}`}
        footer={
          <>
            <Button
              title="Cancelar"
              variant="secondary"
              onPress={() => setApprovalModalVisible(false)}
              style={styles.footerButton}
              disabled={approvalSaving}
            />
            <Button
              title="Aprobar"
              variant="success"
              onPress={handleAprobar}
              loading={approvalSaving}
              disabled={!approvalLogin.trim() || !approvalPassword}
              style={styles.footerButton}
            />
          </>
        }
      >
        <Text style={styles.approvalHint}>
          Ingresá las credenciales de Odoo del usuario con permiso de Controlador de Playa para confirmar el conteo.
        </Text>

        {approvalError ? <Text style={styles.errorText}>{approvalError}</Text> : null}

        <TextField
          label="Usuario Odoo *"
          value={approvalLogin}
          onChangeText={setApprovalLogin}
          placeholder="usuario@ejemplo.com"
          autoCapitalize="none"
          containerStyle={styles.spaced}
        />
        <TextField
          label="Contraseña *"
          value={approvalPassword}
          onChangeText={setApprovalPassword}
          placeholder="••••••••"
          secureTextEntry={!showApprovalPassword}
          textContentType="password"
          rightIcon={showApprovalPassword ? 'visibility-off' : 'visibility'}
          onRightIconPress={() => setShowApprovalPassword((v) => !v)}
          containerStyle={styles.spaced}
        />
      </Dialog>

      {/* Modal de Feedback (Éxito / Error) */}
      {feedback ? (
        <FeedbackDialog
          visible={feedback.visible}
          type={feedback.type}
          title={feedback.title}
          message={feedback.message}
          autoCloseMs={feedback.autoCloseMs}
          onClose={() => {
            const wasSuccess = feedback.type === 'success' && feedback.title === 'Guardado correctamente';
            setFeedback(null);
            if (wasSuccess) onClose();
          }}
          onConfirm={() => {
            const wasSuccess = feedback.type === 'success' && feedback.title === 'Guardado correctamente';
            setFeedback(null);
            if (wasSuccess) onClose();
          }}
        />
      ) : null}
    </Dialog>
  );
}

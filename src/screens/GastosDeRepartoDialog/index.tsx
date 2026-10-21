import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import {
  Button,
  Dialog,
  FloatingActionButton,
  IconButton,
  ListItem,
  SearchBar,
  TextField,
} from '@/components';
import { colors } from '@/theme/tokens';
import { RepartoApiError } from '@/api/repartoApiClient';
import { queuedWrites } from '@/sync/queuedWrites';
import { useGastosDeReparto, useTiposGasto } from '@/hooks/useGastosDeReparto';
import type { GastoDeReparto, TipoGasto } from '@/api/types';
import { styles } from './styles';
import type { GastosDeRepartoDialogProps, VistaGasto } from './types';
import {
  buildOptimisticGasto,
  calculateTotalGastos,
  canSaveGasto,
  filterTiposGasto,
  TIPOS_FALLBACK,
} from './utils';

export type { GastosDeRepartoDialogProps, VistaGasto } from './types';

/**
 * "Gastos de Reparto" drawer entry. Two views inside one `Dialog` (same
 * body-swap pattern as ControlDePlayaDialog):
 *  - `list`  — declared expenses + total, with a FAB to add one
 *  - `form`  — "Declarar Nuevo Gasto" (Tipo picker + Descripción + Monto)
 *
 * `GET /insa/api/gastos-reparto` isn't built yet, so the list only shows what
 * was declared in this session (kept in `optimistas`). "Guardar" enqueues via
 * `queuedWrites.crearGastoReparto` — the Sync tab tracks it and it replays
 * when the endpoint lands.
 */
export function GastosDeRepartoDialog({ visible, onClose, deliveryDate }: GastosDeRepartoDialogProps) {
  const { data: gastosServer, refetch: refetchGastos } = useGastosDeReparto(deliveryDate);
  const { data: tiposServer } = useTiposGasto();
  const tipos = tiposServer && tiposServer.length > 0 ? tiposServer : TIPOS_FALLBACK;

  const [vista, setVista] = useState<VistaGasto>('list');
  const [optimistas, setOptimistas] = useState<GastoDeReparto[]>([]);

  const [tipo, setTipo] = useState<TipoGasto | null>(null);
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [comprobanteUri, setComprobanteUri] = useState<string | null>(null);
  const [comprobanteBase64, setComprobanteBase64] = useState<string | null>(null);
  const [pickerQuery, setPickerQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      setVista('list');
      setTipo(null);
      setDescripcion('');
      setMonto('');
      setComprobanteUri(null);
      setComprobanteBase64(null);
      setPickerQuery('');
      setErrorMsg(null);
    }
  }, [visible]);

  const gastos = useMemo(
    () => [...optimistas, ...(gastosServer ?? [])],
    [optimistas, gastosServer],
  );
  const total = calculateTotalGastos(gastos);
  const puedeGuardar = canSaveGasto(tipo, monto);

  const tiposFiltrados = useMemo(() => {
    return filterTiposGasto(tipos, pickerQuery);
  }, [tipos, pickerQuery]);

  async function handleTomarFoto() {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        setErrorMsg('Se requiere permiso para usar la cámara.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.6,
        base64: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setComprobanteUri(asset.uri);
        setComprobanteBase64(asset.base64 || null);
      }
    } catch {
      setErrorMsg('No se pudo abrir la cámara.');
    }
  }

  function handleEliminarFoto() {
    setComprobanteUri(null);
    setComprobanteBase64(null);
  }

  async function handleGuardar() {
    if (!tipo) return;
    setSaving(true);
    setErrorMsg(null);
    try {
      const outboxItem = await queuedWrites.crearGastoReparto({
        date: deliveryDate,
        tipo: tipo.codigo,
        descripcion: descripcion.trim(),
        monto: Number(monto),
        comprobante: comprobanteBase64,
      });
      if (outboxItem) {
        // Encolado offline: mantenerlo optimista
        const nuevoGasto = buildOptimisticGasto(deliveryDate, tipo, descripcion, Number(monto));
        setOptimistas((prev) => [nuevoGasto, ...prev]);
      } else {
        // Impactó directo en el servidor: refetch
        void refetchGastos();
      }
      setTipo(null);
      setDescripcion('');
      setMonto('');
      setComprobanteUri(null);
      setComprobanteBase64(null);
      setVista('list');
    } catch (err) {
      setErrorMsg(err instanceof RepartoApiError ? err.message : 'No se pudo guardar el gasto.');
    } finally {
      setSaving(false);
    }
  }

  if (visible && vista === 'tipoPicker') {
    return (
      <Dialog
        visible={visible}
        onClose={() => setVista('form')}
        header={
          <View style={styles.header}>
            <IconButton icon="arrow-back" onPress={() => setVista('form')} color={colors.onPrimary} />
            <Text style={styles.headerTitle}>Elegir tipo</Text>
          </View>
        }
      >
        <SearchBar value={pickerQuery} onChangeText={setPickerQuery} placeholder="Buscar..." />
        <View style={styles.pickerList}>
          {tiposFiltrados.map((t) => (
            <ListItem
              key={t.codigo}
              title={t.label}
              onPress={() => {
                setTipo(t);
                setPickerQuery('');
                setVista('form');
              }}
            />
          ))}
          {tiposFiltrados.length === 0 ? <Text style={styles.empty}>Sin resultados.</Text> : null}
        </View>
      </Dialog>
    );
  }

  if (visible && vista === 'form') {
    return (
      <Dialog
        visible={visible}
        onClose={onClose}
        header={
          <View style={styles.header}>
            <IconButton icon="arrow-back" onPress={() => setVista('list')} color={colors.onPrimary} />
            <Text style={styles.headerTitle}>Declarar Nuevo Gasto</Text>
          </View>
        }
        footer={
          <Button
            title="Guardar"
            variant="primary"
            onPress={handleGuardar}
            loading={saving}
            disabled={!puedeGuardar}
            style={styles.footerButton}
          />
        }
      >
        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

        <Text style={styles.fieldLabel}>Tipo</Text>
        <ListItem
          title={tipo ? tipo.label : 'Seleccionar...'}
          leadingIcon="sell"
          onPress={() => setVista('tipoPicker')}
        />

        <TextField
          label="Descripción"
          value={descripcion}
          onChangeText={setDescripcion}
          containerStyle={styles.spaced}
        />
        <TextField
          label="Monto"
          value={monto}
          onChangeText={setMonto}
          keyboardType="numeric"
          placeholder="0"
          leftIcon="attach-money"
          containerStyle={styles.spaced}
        />

        <View style={styles.comprobanteSection}>
          <Text style={styles.fieldLabel}>Comprobante (opcional)</Text>
          {comprobanteUri ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: comprobanteUri }} style={styles.thumbnail} />
              <View style={styles.previewInfo}>
                <Text style={styles.previewTitle}>Foto adjunta</Text>
                <Text style={styles.previewSubtitle}>Toca para cambiar la foto</Text>
              </View>
              <IconButton
                icon="photo-camera"
                onPress={handleTomarFoto}
                color={colors.primary}
              />
              <IconButton
                icon="close"
                onPress={handleEliminarFoto}
                color={colors.error}
              />
            </View>
          ) : (
            <Pressable style={styles.fotoButton} onPress={handleTomarFoto}>
              <MaterialIcons name="photo-camera" size={22} color={colors.primary} />
              <Text style={styles.fotoButtonText}>Tomar foto del comprobante</Text>
            </Pressable>
          )}
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
          <Text style={styles.headerTitle}>Gastos de Reparto</Text>
          <IconButton icon="close" onPress={onClose} color={colors.onPrimary} />
        </View>
      }
      footer={
        <View style={styles.dialogFooterContent}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalMonto}>${total.toFixed(2)}</Text>
          </View>
          <Button
            title="Declarar Gasto"
            variant="primary"
            onPress={() => setVista('form')}
            style={styles.nuevoGastoButton}
          />
        </View>
      }
    >
      <View style={styles.listWrap}>
        {gastos.length === 0 ? (
          <Text style={styles.empty}>Todavía no declaraste gastos para esta fecha.</Text>
        ) : (
          gastos.map((g) => (
            <View key={g.id} style={styles.gastoRow}>
              <View style={styles.gastoTexts}>
                <Text style={styles.gastoTitulo}>
                  {g.tipoLabel}
                  {g.id < 0 ? '  ·  pendiente' : ''}
                </Text>
                {g.descripcion ? <Text style={styles.gastoDesc}>{g.descripcion}</Text> : null}
              </View>
              <Text style={styles.gastoMonto}>${g.monto.toFixed(2)}</Text>
            </View>
          ))
        )}
      </View>
    </Dialog>
  );
}

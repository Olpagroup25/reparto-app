import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Dialog, FeedbackDialog, IconButton, ListItem, SearchBar, TextField } from '@/components';
import { colors } from '@/theme/tokens';
import { repartoApiClient, RepartoApiError } from '@/api/repartoApiClient';
import { useCalles, useCiudades } from '@/hooks/useCatalogos';
import { queuedWrites } from '@/sync/queuedWrites';
import type { Calle, Ciudad, ClienteBusqueda, FrecuenciaEntrega, TipoCliente } from '@/api/types';
import { styles } from './styles';
import type { AltaClienteDialogProps, FeedbackState, PickerFor } from './types';
import {
  buildClienteBusqueda,
  buildCrearClientePayload,
  canSaveAltaCliente,
  DIAS_SEMANA,
  filterPickerOptions,
  FRECUENCIAS,
} from './utils';

export type { AltaClienteDialogProps, FeedbackState, FrecuenciaOption, PickerFor } from './types';

/**
 * "+ Dar de alta un cliente nuevo" en el Buscador (Paso 2.7) — mismo
 * modelo insa.city/insa.street que el formulario público de alta
 * (feature-formulario-alta), pero a diferencia de ese formulario, acá SÍ
 * queda marcado customer_rank=1 al crear (ver POST /insa/api/clientes):
 * solo la usan repartidores autenticados con la credencial de su ruta, no
 * es un formulario público abierto a cualquiera.
 */
export function AltaClienteDialog({ visible, onClose, deliveryDate, onCreated }: AltaClienteDialogProps) {
  const queryClient = useQueryClient();
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [cuitDni, setCuitDni] = useState('');
  const [tipoCliente, setTipoCliente] = useState<TipoCliente>('person');
  const [frecuencia, setFrecuencia] = useState<FrecuenciaEntrega>('semanal');
  const [diasSemana, setDiasSemana] = useState<string[]>([]);

  const [ciudad, setCiudad] = useState<Ciudad | null>(null);
  const [calle, setCalle] = useState<Calle | null>(null);
  const [numero, setNumero] = useState('');

  const [pickerFor, setPickerFor] = useState<PickerFor>(null);
  const [pickerQuery, setPickerQuery] = useState('');

  // Búsqueda en vivo de clientes existentes para evitar duplicados
  const [coincidencias, setCoincidencias] = useState<ClienteBusqueda[]>([]);
  const [buscandoCoincidencias, setBuscandoCoincidencias] = useState(false);

  // Validación y bloqueo por número de documento (DNI / CUIT)
  const [clienteDuplicadoDoc, setClienteDuplicadoDoc] = useState<ClienteBusqueda | null>(null);
  const [buscandoDoc, setBuscandoDoc] = useState(false);

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [createdCliente, setCreatedCliente] = useState<ClienteBusqueda | null>(null);

  // Queries (persistidas para funcionar offline)
  const { data: ciudades = [], isError: ciudadesError } = useCiudades();
  const { data: calles = [], isFetching: loadingCalles, isError: callesError } = useCalles(ciudad?.cityId ?? null);

  // Reset form when dialog closes or opens
  useEffect(() => {
    if (!visible) {
      setNombre('');
      setTelefono('');
      setCuitDni('');
      setTipoCliente('person');
      setFrecuencia('semanal');
      setDiasSemana([]);
      setCiudad(null);
      setCalle(null);
      setNumero('');
      setPickerFor(null);
      setPickerQuery('');
      setCoincidencias([]);
      setBuscandoCoincidencias(false);
      setClienteDuplicadoDoc(null);
      setBuscandoDoc(false);
      setErrorMsg(null);
      setFeedback(null);
      setCreatedCliente(null);
    }
  }, [visible]);

  // Debounced search for existing matches as the repartidor types the document (DNI/CUIT)
  useEffect(() => {
    const rawDoc = cuitDni.replace(/[\.\-\s\/]/g, '').trim();
    if (rawDoc.length < 5) {
      setClienteDuplicadoDoc(null);
      setBuscandoDoc(false);
      return;
    }
    let cancelled = false;
    setBuscandoDoc(true);
    const timer = setTimeout(async () => {
      try {
        const match = await repartoApiClient.verificarDocumentoExistente(cuitDni.trim());
        if (!cancelled) {
          setClienteDuplicadoDoc(match);
        }
      } catch {
        if (!cancelled) setClienteDuplicadoDoc(null);
      } finally {
        if (!cancelled) setBuscandoDoc(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [cuitDni]);

  // Debounced search for existing matches as the repartidor types the name
  useEffect(() => {
    const trimmed = nombre.trim();
    if (trimmed.length < 2) {
      setCoincidencias([]);
      setBuscandoCoincidencias(false);
      return;
    }
    let cancelled = false;
    setBuscandoCoincidencias(true);
    const timer = setTimeout(async () => {
      try {
        const results = await repartoApiClient.buscarClientes(trimmed);
        if (!cancelled) {
          setCoincidencias(results);
        }
      } catch {
        if (!cancelled) setCoincidencias([]);
      } finally {
        if (!cancelled) setBuscandoCoincidencias(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [nombre]);

  // Changing city invalidates whatever street was picked for the old one.
  useEffect(() => {
    setCalle(null);
  }, [ciudad]);

  useEffect(() => {
    if (ciudadesError) setErrorMsg('No se pudieron cargar las ciudades.');
    else if (callesError) setErrorMsg('No se pudieron cargar las calles.');
  }, [ciudadesError, callesError]);

  const opcionesPicker: Array<Ciudad | Calle> = pickerFor === 'ciudad' ? ciudades : calles;
  const opcionesFiltradas = useMemo(() => {
    return filterPickerOptions(opcionesPicker, pickerQuery);
  }, [opcionesPicker, pickerQuery]);

  function elegirOpcion(opcion: Ciudad | Calle) {
    if (pickerFor === 'ciudad' && 'cityId' in opcion) {
      setCiudad(opcion);
    } else if (pickerFor === 'calle' && 'streetId' in opcion) {
      setCalle(opcion);
    }
    setPickerFor(null);
    setPickerQuery('');
  }

  function toggleDia(dia: string) {
    setDiasSemana((prev) =>
      prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]
    );
  }

  const puedeGuardar = canSaveAltaCliente(nombre, ciudad, calle, numero, Boolean(clienteDuplicadoDoc));

  async function handleGuardar() {
    if (!ciudad || !calle) return;

    // Validación defensiva inmediata previa a enviar la solicitud
    const cleanDoc = cuitDni.replace(/[\.\-\s\/]/g, '').trim();
    if (cleanDoc.length >= 5) {
      setSaving(true);
      try {
        const match = await repartoApiClient.verificarDocumentoExistente(cuitDni.trim());
        if (match) {
          setClienteDuplicadoDoc(match);
          setSaving(false);
          setErrorMsg(`Ya existe un cliente con el documento ${cuitDni.trim()}: ${match.nombre}`);
          setFeedback({
            visible: true,
            type: 'error',
            title: 'Documento Duplicado',
            message: `No se puede dar de alta porque el DNI/CUIT ${cuitDni.trim()} ya pertenece a "${match.nombre}".`,
          });
          return;
        }
      } catch {
        // Continuar si la verificación previa falla por timeout
      }
    }

    if (clienteDuplicadoDoc) {
      setErrorMsg('No se puede crear un cliente con documento duplicado.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    try {
      const payload = buildCrearClientePayload({
        nombre,
        ciudad,
        calle,
        numero,
        telefono,
        tipoCliente,
        cuitDni,
        frecuencia,
        diasSemana,
        deliveryDate,
      });

      // Offline-first: the alta is queued locally (see src/sync/) and gets a
      // negative temp partnerId so the "Registrar visita" chain can continue
      // offline — the sync engine swaps in the real id when the alta syncs.
      const { tempPartnerId, partnerId } = await queuedWrites.crearCliente(payload);

      const nuevoCliente = buildClienteBusqueda({
        partnerId: partnerId ?? tempPartnerId,
        nombre,
        calleNombre: calle.nombre,
        numero,
        ciudadNombre: ciudad.nombre,
      });

      setCreatedCliente(nuevoCliente);
      void queryClient.invalidateQueries({ queryKey: ['reparto'] });
      setFeedback({
        visible: true,
        type: 'success',
        title: '¡Cliente Creado!',
        message: `El cliente "${nombre.trim()}" fue registrado exitosamente.`,
        autoCloseMs: 1600,
      });
    } catch (err) {
      const msg = err instanceof RepartoApiError ? err.message : 'No se pudo guardar el cliente.';
      setErrorMsg(msg);
      setFeedback({
        visible: true,
        type: 'error',
        title: 'Error al crear cliente',
        message: msg,
      });
    } finally {
      setSaving(false);
    }
  }

  // Picker view (ciudad o calle) swaps in for the main body while active
  if (visible && pickerFor) {
    return (
      <Dialog
        visible={visible}
        onClose={() => setPickerFor(null)}
        header={
          <View style={styles.pickerHeader}>
            <IconButton icon="arrow-back" onPress={() => setPickerFor(null)} color={colors.onSurface} />
            <Text style={styles.pickerTitle}>{pickerFor === 'ciudad' ? 'Elegir ciudad' : 'Elegir calle'}</Text>
          </View>
        }
      >
        <SearchBar value={pickerQuery} onChangeText={setPickerQuery} placeholder="Buscar..." />
        <View style={styles.pickerList}>
          {opcionesFiltradas.map((o) => (
            <ListItem
              key={'cityId' in o ? `ciudad-${o.cityId}` : `calle-${o.streetId}`}
              title={o.nombre}
              onPress={() => elegirOpcion(o)}
            />
          ))}
          {opcionesFiltradas.length === 0 ? <Text style={styles.emptyText}>Sin resultados.</Text> : null}
        </View>
      </Dialog>
    );
  }

  return (
    <Dialog
      visible={visible}
      onClose={onClose}
      title="Dar de alta un cliente nuevo"
      footer={
        <>
          <Button title="Cancelar" variant="secondary" onPress={onClose} style={styles.footerButton} />
          <Button
            title="Crear"
            variant="primary"
            onPress={handleGuardar}
            loading={saving}
            disabled={!puedeGuardar}
            style={styles.footerButton}
          />
        </>
      }
    >
      {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

      {/* Selector de Tipo: Persona / Empresa */}
      <Text style={styles.fieldLabel}>Tipo de cliente *</Text>
      <View style={styles.segmentedContainer}>
        <Pressable
          style={[styles.segmentBtn, tipoCliente === 'person' && styles.segmentBtnActive]}
          onPress={() => setTipoCliente('person')}
        >
          <MaterialIcons
            name="person"
            size={20}
            color={tipoCliente === 'person' ? colors.onPrimary : colors.onSurfaceVariant}
          />
          <Text style={[styles.segmentBtnText, tipoCliente === 'person' && styles.segmentBtnTextActive]}>
            Persona
          </Text>
        </Pressable>
        <Pressable
          style={[styles.segmentBtn, tipoCliente === 'company' && styles.segmentBtnActive]}
          onPress={() => setTipoCliente('company')}
        >
          <MaterialIcons
            name="business"
            size={20}
            color={tipoCliente === 'company' ? colors.onPrimary : colors.onSurfaceVariant}
          />
          <Text style={[styles.segmentBtnText, tipoCliente === 'company' && styles.segmentBtnTextActive]}>
            Empresa
          </Text>
        </Pressable>
      </View>

      <TextField
        label={tipoCliente === 'company' ? 'Razón Social *' : 'Nombre y Apellido *'}
        value={nombre}
        onChangeText={setNombre}
        placeholder={tipoCliente === 'company' ? 'Ej: Distribuidora Sol S.A.' : 'Ej: Juan Pérez'}
        containerStyle={styles.spaced}
      />

      <TextField
        label={tipoCliente === 'company' ? 'CUIT' : 'DNI / CUIT'}
        value={cuitDni}
        onChangeText={setCuitDni}
        keyboardType="numeric"
        placeholder={tipoCliente === 'company' ? '30-xxxxxxxx-x' : 'Documento o CUIT'}
        error={clienteDuplicadoDoc ? 'El número de documento ya está registrado en el sistema' : undefined}
        containerStyle={styles.spaced}
      />

      {buscandoDoc ? (
        <Text style={styles.buscandoText}>Verificando si el documento ya existe...</Text>
      ) : null}

      {clienteDuplicadoDoc ? (
        <View style={styles.duplicadoDocContainer}>
          <Text style={styles.duplicadoDocTitle}>
            🚫 Ya existe un cliente registrado con este documento ({cuitDni.trim()}):
          </Text>
          <Pressable
            style={styles.coincidenciaCard}
            onPress={() => {
              onCreated(clienteDuplicadoDoc);
              onClose();
            }}
          >
            <View style={styles.coincidenciaInfo}>
              <Text style={styles.coincidenciaNombre}>{clienteDuplicadoDoc.nombre}</Text>
              <Text style={styles.coincidenciaDireccion}>
                {clienteDuplicadoDoc.direccion || 'Sin dirección cargada'}
              </Text>
            </View>
            <Button
              title="Usar este cliente"
              variant="secondary"
              onPress={() => {
                onCreated(clienteDuplicadoDoc);
                onClose();
              }}
            />
          </Pressable>
          <Text style={styles.duplicadoDocHint}>
            No se permite crear un cliente duplicado con el mismo DNI/CUIT.
          </Text>
        </View>
      ) : null}

      {buscandoCoincidencias ? (
        <Text style={styles.buscandoText}>Buscando si el cliente ya existe...</Text>
      ) : null}

      {coincidencias.length > 0 ? (
        <View style={styles.coincidenciasContainer}>
          <Text style={styles.coincidenciasTitle}>
            ⚠️ Ya existen clientes activos registrados con nombre similar:
          </Text>
          {coincidencias.map((c) => (
            <Pressable
              key={c.partnerId}
              style={styles.coincidenciaCard}
              onPress={() => {
                onCreated(c);
                onClose();
              }}
            >
              <View style={styles.coincidenciaInfo}>
                <Text style={styles.coincidenciaNombre}>{c.nombre}</Text>
                <Text style={styles.coincidenciaDireccion}>{c.direccion || 'Sin dirección cargada'}</Text>
              </View>
              <Button
                title="Usar este"
                variant="secondary"
                onPress={() => {
                  onCreated(c);
                  onClose();
                }}
              />
            </Pressable>
          ))}
          <Text style={styles.coincidenciasHint}>
            Si es la misma persona, tocala para usarla. Si es un cliente nuevo, continuá completando abajo.
          </Text>
        </View>
      ) : null}

      <Text style={styles.fieldLabel}>Ciudad / Barrio *</Text>
      <ListItem
        title={ciudad ? ciudad.nombre : 'Elegir ciudad...'}
        leadingIcon="location-city"
        onPress={() => setPickerFor('ciudad')}
      />

      <Text style={styles.fieldLabel}>Calle *</Text>
      <ListItem
        title={loadingCalles ? 'Cargando...' : calle ? calle.nombre : 'Elegir calle...'}
        leadingIcon="signpost"
        onPress={() => ciudad && setPickerFor('calle')}
      />
      {!ciudad ? <Text style={styles.hintText}>Elegí una ciudad primero.</Text> : null}

      <View style={styles.row}>
        <TextField
          label="Número *"
          value={numero}
          onChangeText={setNumero}
          keyboardType="numeric"
          containerStyle={[styles.spaced, styles.rowItem]}
        />
        <TextField
          label="Teléfono"
          value={telefono}
          onChangeText={setTelefono}
          keyboardType="phone-pad"
          containerStyle={[styles.spaced, styles.rowItem]}
        />
      </View>

      {/* Frecuencia de entrega */}
      <Text style={styles.fieldLabel}>Frecuencia de entrega</Text>
      <View style={styles.chipsRow}>
        {FRECUENCIAS.map((f) => {
          const selected = frecuencia === f.key;
          return (
            <Pressable
              key={f.key}
              style={[styles.chip, selected && styles.chipActive]}
              onPress={() => setFrecuencia(f.key)}
            >
              <Text style={[styles.chipText, selected && styles.chipTextActive]}>{f.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Días de la semana (Multiselect) */}
      <Text style={styles.fieldLabel}>Días de la semana</Text>
      <View style={styles.daysRow}>
        {DIAS_SEMANA.map((dia) => {
          const selected = diasSemana.includes(dia);
          return (
            <Pressable
              key={dia}
              style={[styles.dayChip, selected && styles.dayChipActive]}
              onPress={() => toggleDia(dia)}
            >
              <Text style={[styles.dayChipText, selected && styles.dayChipTextActive]}>{dia}</Text>
            </Pressable>
          );
        })}
      </View>
      {diasSemana.length === 0 ? (
        <Text style={styles.hintText}>Seleccioná uno o más días de entrega habitual.</Text>
      ) : null}

      {/* Modal de Feedback (Éxito / Error) */}
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
            if (isSuccess && createdCliente) {
              onCreated(createdCliente);
              onClose();
            }
          }}
          onConfirm={() => {
            const isSuccess = feedback.type === 'success';
            setFeedback(null);
            if (isSuccess && createdCliente) {
              onCreated(createdCliente);
              onClose();
            }
          }}
        />
      ) : null}
    </Dialog>
  );
}

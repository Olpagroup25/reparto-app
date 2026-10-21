import { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Dialog, FeedbackDialog, IconButton, ListItem, SearchBar, TextField } from '@/components';
import { colors } from '@/theme/tokens';
import { repartoApiClient, RepartoApiError } from '@/api/repartoApiClient';
import { useCalles, useCiudades } from '@/hooks/useCatalogos';
import type { Calle, Ciudad, ClienteBusqueda } from '@/api/types';
import { styles } from './styles';
import type { ActivarClientePropioDialogProps, FeedbackState, PickerFor } from './types';
import { buildActivarClientePayload, canActivarCliente, filterCatalogOptions } from './utils';

export type { ActivarClientePropioDialogProps, FeedbackState, PickerFor } from './types';

/**
 * Diálogo para activar a una persona física como "Cliente por derecho propio"
 * (Caso 3 / insa_autorizacion_pedido). Permite cargar su domicilio particular
 * dedicado y crear su fsm.location propia en Odoo.sh en tiempo real.
 */
export function ActivarClientePropioDialog({
  visible,
  onClose,
  deliveryDate,
  cliente,
  onActivated,
}: ActivarClientePropioDialogProps) {
  const queryClient = useQueryClient();
  const [numero, setNumero] = useState('');
  const [piso, setPiso] = useState('');
  const [depto, setDepto] = useState('');
  const [notas, setNotas] = useState('');

  const [ciudad, setCiudad] = useState<Ciudad | null>(null);
  const [calle, setCalle] = useState<Calle | null>(null);

  const { data: ciudades = [], isError: ciudadesError } = useCiudades();
  const { data: calles = [], isFetching: loadingCalles, isError: callesError } = useCalles(ciudad?.cityId);

  const [pickerFor, setPickerFor] = useState<PickerFor>(null);
  const [pickerQuery, setPickerQuery] = useState('');

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [activatedCliente, setActivatedCliente] = useState<ClienteBusqueda | null>(null);

  useEffect(() => {
    if (!visible) {
      setNumero('');
      setPiso('');
      setDepto('');
      setNotas('');
      setCiudad(null);
      setCalle(null);
      setPickerFor(null);
      setPickerQuery('');
      setErrorMsg(null);
      setFeedback(null);
      setActivatedCliente(null);
    }
  }, [visible]);

  useEffect(() => {
    setCalle(null);
  }, [ciudad]);

  useEffect(() => {
    if (ciudadesError) setErrorMsg('No se pudieron cargar las ciudades.');
    else if (callesError) setErrorMsg('No se pudieron cargar las calles.');
  }, [ciudadesError, callesError]);

  const opcionesFiltradas = useMemo(() => {
    const list: Array<Ciudad | Calle> = pickerFor === 'ciudad' ? ciudades : calles;
    return filterCatalogOptions(list, pickerQuery);
  }, [pickerFor, ciudades, calles, pickerQuery]);

  function elegirOpcion(opcion: Ciudad | Calle) {
    if (pickerFor === 'ciudad' && 'cityId' in opcion) {
      setCiudad(opcion);
    } else if (pickerFor === 'calle' && 'streetId' in opcion) {
      setCalle(opcion);
    }
    setPickerFor(null);
    setPickerQuery('');
  }

  const puedeGuardar = canActivarCliente(cliente, ciudad, calle, numero);

  async function handleActivar() {
    if (!cliente || !ciudad || !calle) return;
    setSaving(true);
    setErrorMsg(null);
    try {
      const payload = buildActivarClientePayload({
        partnerId: cliente.partnerId,
        cityId: ciudad.cityId,
        streetId: calle.streetId,
        streetNumber: numero,
        floor: piso,
        apartment: depto,
        notes: notas,
        date: deliveryDate,
      });

      const actualizado = await repartoApiClient.activarClientePropio(payload);

      setActivatedCliente(actualizado);
      void queryClient.invalidateQueries({ queryKey: ['reparto'] });
      setFeedback({
        visible: true,
        type: 'success',
        title: '¡Cliente Activado!',
        message: `El cliente "${cliente.nombre}" ha sido activado por derecho propio en Odoo.`,
        autoCloseMs: 1600,
      });
    } catch (err) {
      const msg = err instanceof RepartoApiError ? err.message : 'No se pudo activar el cliente.';
      setErrorMsg(msg);
      setFeedback({
        visible: true,
        type: 'error',
        title: 'Error de activación',
        message: msg,
      });
    } finally {
      setSaving(false);
    }
  }

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
      title={cliente ? `Activar cliente propio — ${cliente.nombre}` : 'Activar cliente por derecho propio'}
      footer={
        <>
          <Button title="Cancelar" variant="secondary" onPress={onClose} style={styles.footerButton} />
          <Button
            title="Activar"
            variant="primary"
            onPress={handleActivar}
            loading={saving}
            disabled={!puedeGuardar}
            style={styles.footerButton}
          />
        </>
      }
    >
      {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

      <Text style={styles.descriptionText}>
        Cargá el domicilio del cliente para darlo de alta por derecho propio y registrar su ubicación en Odoo.
      </Text>

      <ListItem
        title={ciudad ? ciudad.nombre : 'Elegir ciudad...'}
        leadingIcon="location-city"
        onPress={() => setPickerFor('ciudad')}
      />

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
          label="Piso"
          value={piso}
          onChangeText={setPiso}
          containerStyle={[styles.spaced, styles.rowItemSmall]}
        />
        <TextField
          label="Dto"
          value={depto}
          onChangeText={setDepto}
          containerStyle={[styles.spaced, styles.rowItemSmall]}
        />
      </View>

      <TextField
        label="Referencias / Notas del domicilio"
        value={notas}
        onChangeText={setNotas}
        placeholder="Ej: Portón blanco, timbre derecho"
        containerStyle={styles.spaced}
      />

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
            if (isSuccess && activatedCliente) {
              onActivated(activatedCliente);
              onClose();
            }
          }}
          onConfirm={() => {
            const isSuccess = feedback.type === 'success';
            setFeedback(null);
            if (isSuccess && activatedCliente) {
              onActivated(activatedCliente);
              onClose();
            }
          }}
        />
      ) : null}
    </Dialog>
  );
}

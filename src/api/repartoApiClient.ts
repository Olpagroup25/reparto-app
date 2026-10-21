import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { ODOO_BASE_URL } from '@/config/env';
import {
  ActivarClientePropioParams,
  AuthErrorCode,
  Calle,
  ClienteBusqueda,
  ClienteVisita,
  Ciudad,
  ControlPlaya,
  CrearClienteParams,
  GastoDeReparto,
  HojaDeRutaResponse,
  LineaControlPlaya,
  LiquidacionResponse,
  ProductoCatalogo,
  RepartoSession,
  StockEnRutaItem,
  TipoGasto,
} from './types';

const TOKEN_STORAGE_KEY = 'insa_reparto_session';

// expo-secure-store has no web implementation at all (confirmed: its
// ExpoSecureStore.web.js module export is `{}` — every method, including
// getItemAsync, is simply missing there, not just a no-op). The `w` / web
// preview is a compile smoke-test only (see README), so on web we just skip
// persistence and keep the session in memory for that tab's lifetime,
// rather than crashing on startup.
const canPersist = Platform.OS !== 'web';

// ---------------------------------------------------------------------------
// Clasificación de errores de autenticación
// ---------------------------------------------------------------------------

/**
 * Mapea el mensaje de error de texto que devuelve el backend a un código
 * semántico. El controller de insa_reparto siempre devuelve
 * `{ "error": "<string>" }` — no hay un campo `code` separado, así que
 * se clasifica por coincidencia de substring sobre el mensaje.
 *
 * Mensajes conocidos de verify_token() (insa_repartidor_credencial.py):
 *   "Token inválido."
 *   "Token expirado, iniciá sesión de nuevo."
 *   "Sesión revocada, iniciá sesión de nuevo."
 *
 * Mensaje de _authenticate() cuando hay bloqueo:
 *   "Usuario bloqueado temporalmente por intentos fallidos."
 */
function classifyAuthError(msg: string): AuthErrorCode {
  const m = msg.toLowerCase();
  if (m.includes('revocad')) return 'sesion_revocada';
  if (m.includes('expirad')) return 'token_expirado';
  if (m.includes('bloqueado') || m.includes('bloqueada')) return 'credencial_bloqueada';
  return 'token_invalido';
}

// ---------------------------------------------------------------------------
// Clases de error
// ---------------------------------------------------------------------------

export class RepartoApiError extends Error {
  status: number;
  data: unknown;
  /** Código semántico para manejo diferenciado en la UI y en AuthContext. */
  code: AuthErrorCode | 'generic';

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
    // Clasificar errores de autenticación (401 y 423)
    if (status === 401 || status === 423) {
      this.code = classifyAuthError(message);
    } else {
      this.code = 'generic';
    }
  }
}

// ---------------------------------------------------------------------------
// Interfaces internas de wire shapes (JSON crudo del servidor)
// ---------------------------------------------------------------------------

/** Raw wire shape of _serializar_cliente() en insa_reparto_api.py. */
interface RawClienteVisita {
  partner_id: number;
  nombre: string;
  direccion: string;
  saldo_facturas: number;
  consumos: number;
  fecha_ultima_entrega: string | null;
  fecha_ultima_cobranza: string | null;
  visitado: boolean;
  resultado: 'ausente' | 'sin_gestion' | 'repaso' | null;
  cobro_efectivo: number;
  medio_pago?: 'efectivo' | 'transferencia' | 'cheque' | 'cuenta_corriente';
  referencia_pago?: string;
  lineas_articulo?: Array<{
    product_id: number;
    nombre?: string;
    tipo: 'venta' | 'cambio' | 'bonif' | 'devolucion';
    cantidad: number;
    precio_unitario: number;
  }>;
  lineas_envase?: Array<{
    product_id: number;
    nombre?: string;
    tipo: 'prestamo' | 'devolucion';
    cantidad: number;
  }>;
  iconos_visita: string;
  // C-03: campos de extra/fuera-de-ruta
  es_extra: boolean;
  pedido_extra_id: number | null;
  fuera_de_ruta: boolean;
  // Paso 1.10: deuda de envases
  deuda_envases: Array<{
    product_id: number;
    producto: string;
    saldo: number;
    permitido: number;
    cantidad_a_recuperar: number;
  }>;
  // Solo en pedidos extra (supuesto 0.3 / RN-17)
  nota?: string;
  articulos_solicitados?: Array<{
    product_id: number;
    producto: string;
    cantidad: number;
  }>;
  pedido_habitual?: Array<{
    product_id: number;
    producto: string;
    cantidad: number;
  }>;
  saldos_envase?: Array<{
    product_id: number;
    producto: string;
    saldo: number;
    permitido: number;
    cantidad_a_recuperar: number;
    estado_saldo?: 'debe' | 'a_favor' | 'al_dia';
  }>;
  fue_vencido?: boolean;
  fuc_vencido?: boolean;
  al_dia?: boolean;
}

function mapClienteVisita(raw: RawClienteVisita): ClienteVisita {
  return {
    partnerId: raw.partner_id,
    nombre: raw.nombre,
    direccion: raw.direccion,
    saldoFacturas: raw.saldo_facturas,
    consumos: raw.consumos,
    fechaUltimaEntrega: raw.fecha_ultima_entrega,
    fechaUltimaCobranza: raw.fecha_ultima_cobranza,
    visitado: raw.visitado,
    resultado: raw.resultado,
    cobroEfectivo: raw.cobro_efectivo,
    medioPago: raw.medio_pago ?? 'efectivo',
    referenciaPago: raw.referencia_pago,
    lineasArticulo: raw.lineas_articulo?.map((l) => ({
      productId: l.product_id,
      nombre: l.nombre,
      tipo: l.tipo,
      cantidad: l.cantidad,
      precioUnitario: l.precio_unitario,
    })) ?? [],
    lineasEnvase: raw.lineas_envase?.map((l) => ({
      productId: l.product_id,
      nombre: l.nombre,
      tipo: l.tipo,
      cantidad: l.cantidad,
    })) ?? [],
    iconosVisita: raw.iconos_visita,
    esExtra: raw.es_extra ?? false,
    pedidoExtraId: raw.pedido_extra_id ?? null,
    fueraDeRuta: raw.fuera_de_ruta ?? false,
    fueVencido: raw.fue_vencido ?? false,
    fucVencido: raw.fuc_vencido ?? false,
    alDia: raw.al_dia ?? (!raw.fue_vencido && !raw.fuc_vencido),
    deudaEnvases: (raw.deuda_envases ?? []).map((d) => ({
      productId: d.product_id,
      producto: d.producto,
      saldo: d.saldo,
      permitido: d.permitido,
      cantidadARecuperar: d.cantidad_a_recuperar,
    })),
    saldosEnvase: raw.saldos_envase?.map((s) => ({
      productId: s.product_id,
      producto: s.producto,
      saldo: s.saldo,
      permitido: s.permitido,
      cantidadARecuperar: s.cantidad_a_recuperar,
      estadoSaldo: s.estado_saldo,
    })),
    nota: raw.nota,
    articulosSolicitados: raw.articulos_solicitados?.map((a) => ({
      productId: a.product_id,
      producto: a.producto,
      cantidad: a.cantidad,
    })),
    pedidoHabitual: raw.pedido_habitual?.map((p) => ({
      productId: p.product_id,
      producto: p.producto,
      cantidad: p.cantidad,
    })),
  };
}

/** Raw wire shape of _serializar_control_playa() en insa_reparto_api.py. */
interface RawControlPlaya {
  id: number;
  tipo: 'salida' | 'entrada';
  state: 'borrador' | 'confirmado';
  fecha_hora: string | null;
  kilometros: number;
  aprobado: boolean;
  aprobado_por: string | null;
  aprobado_fecha: string | null;
  lineas: Array<{
    product_id: number;
    producto: string;
    cantidad: number;
    cantidad_vacia: number;
    cantidad_fallada: number;
    a_cargar_pedidos?: number;
  }>;
}

function mapControlPlaya(raw: RawControlPlaya): ControlPlaya {
  const lineas: LineaControlPlaya[] = raw.lineas.map((l) => ({
    productId: l.product_id,
    producto: l.producto,
    cantidad: l.cantidad,
    cantidadVacia: l.cantidad_vacia,
    cantidadFallada: l.cantidad_fallada ?? 0,
    aCargarPedidos: l.a_cargar_pedidos ?? 0,
  }));

  return {
    id: raw.id,
    tipo: raw.tipo,
    state: raw.state ?? 'borrador',
    fechaHora: raw.fecha_hora,
    kilometros: raw.kilometros,
    aprobado: raw.aprobado,
    aprobadoPor: raw.aprobado_por,
    aprobadoFecha: raw.aprobado_fecha,
    lineas,
  };
}

// ---------------------------------------------------------------------------
// Callback de error de autenticación
// ---------------------------------------------------------------------------

/**
 * Callback global registrado por AuthContext para manejar errores de
 * autenticación que ocurren durante requests ya autenticados (token expirado,
 * sesión revocada). La app no puede navegar directamente desde el cliente API
 * — en cambio el cliente llama este callback y AuthContext hace el logout +
 * navegación correspondiente.
 *
 * Solo se invoca para códigos `token_invalido`, `token_expirado` y
 * `sesion_revocada` en requests con `auth: true`. No se invoca durante el
 * propio login (que maneja sus errores directamente).
 */
type AuthErrorHandler = (code: AuthErrorCode, message: string) => void;

/**
 * Client for insa_reparto's OWN auth, confirmed against the real
 * `controllers/insa_reparto_api.py` + `insa.repartidor.credencial` source —
 * deliberately NOT odooClient.ts's Odoo-user/execute_kw pattern:
 *
 * - No Odoo user (internal or portal). One login+password credential per
 *   route/vehicle ("Reparto 01".."17", `insa.repartidor.credencial`), not
 *   per person — `login` is that model's computed field, `password` is
 *   whatever was set via its "Definir contraseña" wizard / `set_password()`.
 * - Issued/validated by a dedicated public controller (auth="public"), not
 *   Odoo's generic /jsonrpc external API.
 * - All endpoints use Bearer token authentication except `login`.
 * - No refresh endpoint: an expired token always requires a new login.
 */
class RepartoApiClient {
  private baseUrl: string;
  private session: RepartoSession | null = null;
  private onAuthError: AuthErrorHandler | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Registra el callback que AuthContext usa para manejar errores de
   * autenticación globales (token expirado, sesión revocada). Llamado
   * una sola vez al montar AuthProvider.
   */
  setAuthErrorHandler(handler: AuthErrorHandler | null) {
    this.onAuthError = handler;
  }

  private async persistSession(session: RepartoSession) {
    if (!canPersist) return;
    await SecureStore.setItemAsync(TOKEN_STORAGE_KEY, JSON.stringify(session));
  }

  /**
   * Método central de HTTP. Plain REST JSON (type="http" controller),
   * no el envelope {jsonrpc:"2.0", params:{...}} de Odoo — confirmado
   * contra controllers/insa_reparto_api.py.
   *
   * Manejo de errores de autenticación en requests con `auth: true`:
   * - Si el servidor devuelve 401 con un mensaje reconocible de token
   *   expirado / sesión revocada / token inválido, se llama `onAuthError`
   *   para que AuthContext fuerce el logout y navegue a Login con el
   *   mensaje apropiado.
   * - El error se propaga igual para que el caller pueda manejarlo también
   *   si lo necesita (ej. whoami() en el restore de sesión al arrancar).
   */
  private async request<T>(
    path: string,
    options: { method?: string; body?: unknown; auth?: boolean } = {},
  ): Promise<T> {
    const { method = 'GET', body, auth = true } = options;

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (auth) {
      if (!this.session) throw new Error('No hay sesión activa. Volvé a iniciar sesión.');
      headers.Authorization = `Bearer ${this.session.token}`;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const json = await response.json().catch(() => null);

    // El controller usa siempre { error: "..." } para errores, nunca { message: "..." }.
    if (!response.ok) {
      const errorMsg = json?.error ?? response.statusText;
      const err = new RepartoApiError(response.status, errorMsg, json);

      // Notificar a AuthContext para logout forzado en errores de token
      // durante sesiones activas. No invocar en el propio login (auth=false).
      if (auth && err.code !== 'generic' && err.code !== 'credencial_bloqueada') {
        this.onAuthError?.(err.code, errorMsg);
      }

      throw err;
    }

    return json as T;
  }

  // ---------------------------------------------------------------------------
  // Autenticación
  // ---------------------------------------------------------------------------

  /**
   * Logs in with the route/vehicle credential's login+password (NOT a
   * single opaque credential string) — backed by
   * insa.repartidor.credencial._authenticate().
   *
   * POST /insa/api/login, body `{ login, password }`, response
   * `{ token, expira_en_horas, reparto: { route_id, numero_reparto, login } }`.
   *
   * Errores posibles (RepartoApiError):
   *   status=401, code='token_invalido'         → credenciales incorrectas
   *   status=401, code='credencial_bloqueada'   → bloqueado por intentos fallidos
   */
  async login(login: string, password: string): Promise<RepartoSession> {
    const result = await this.request<{
      token: string;
      expira_en_horas: number;
      reparto: { route_id: number; numero_reparto: number; login: string };
    }>('/insa/api/login', {
      method: 'POST',
      body: { login, password },
      auth: false,
    });

    const session: RepartoSession = {
      token: result.token,
      login: result.reparto.login,
      routeId: result.reparto.route_id,
      numeroReparto: result.reparto.numero_reparto,
      expiraEnHoras: result.expira_en_horas,
    };

    this.session = session;
    await this.persistSession(session);

    return session;
  }

  /**
   * Confirms the current token is still valid and returns route info.
   *
   * GET /insa/api/whoami, Bearer token, response
   * `{ route_id, numero_reparto, login, last_login, feature_dispensers_repuestos }`.
   */
  async whoami(): Promise<RepartoSession> {
    const result = await this.request<{
      route_id: number;
      numero_reparto: number;
      login: string;
      last_login: string | null;
      feature_dispensers_repuestos: boolean;
    }>('/insa/api/whoami');

    const session: RepartoSession = {
      token: this.session!.token,
      login: result.login,
      routeId: result.route_id,
      numeroReparto: result.numero_reparto,
      lastLogin: result.last_login,
    };

    this.session = session;
    await this.persistSession(session);

    return session;
  }

  // ---------------------------------------------------------------------------
  // Hoja de ruta y clientes
  // ---------------------------------------------------------------------------

  /**
   * La hoja de ruta del día para la ruta del token — el backend siempre
   * resuelve route_id desde el token, nunca desde un parámetro del cliente.
   *
   * GET /insa/api/hoja-de-ruta?date=YYYY-MM-DD, response
   * `{ hoja_ruta: {...} | null, clientes: [...], fuc_umbral_saldo: number }`.
   *
   * `hoja_ruta: null` significa que no hay dayroute para esa fecha/ruta
   * (estado normal, no un error).
   */
  async getHojaDeRuta(date: string): Promise<HojaDeRutaResponse> {
    const result = await this.request<{
      hoja_ruta: {
        id: number;
        date: string;
        state: 'borrador' | 'en_reparto' | 'consolidando' | 'cerrada';
        reparto_numero: number;
      } | null;
      clientes: RawClienteVisita[];
      fuc_umbral_saldo: number;
      solo_lectura?: boolean;
    }>(`/insa/api/hoja-de-ruta?date=${encodeURIComponent(date)}`);

    return {
      hojaRuta: result.hoja_ruta && {
        id: result.hoja_ruta.id,
        date: result.hoja_ruta.date,
        state: result.hoja_ruta.state,
        numeroReparto: result.hoja_ruta.reparto_numero,
      },
      clientes: result.clientes.map(mapClienteVisita),
      fucUmbralSaldo: result.fuc_umbral_saldo ?? 30000,
      soloLectura: Boolean(result.solo_lectura),
    };
  }

  /**
   * Registra o actualiza (upsert por partner) un insa.movimiento.cliente
   * en la hoja de ruta del día. El backend hace el upsert — un segundo POST
   * al mismo cliente/hoja actualiza el existente en vez de duplicarlo.
   *
   * POST /insa/api/visita, response es el mismo shape de _serializar_cliente().
   *
   * Campos de líneas de artículo:
   *   `motivo`        (C-06): requerido cuando `tipo='devolucion'`.
   *   `cambioDirecto` (C-06): default true — se entrega uno nuevo en el acto.
   * Campo de cobro:
   *   `medioPago`     (C-04): 'efectivo' | 'cheque' | 'transferencia'. Default 'efectivo'.
   *                   Solo 'efectivo' entra en la liquidación de caja.
   */
  async registrarVisita(params: {
    date: string;
    partnerId: number;
    resultado?: 'ausente' | 'sin_gestion' | 'repaso';
    visitado?: boolean;
    cobroEfectivo?: number;
    medioPago?: 'efectivo' | 'cheque' | 'transferencia' | 'sin_transaccion';
    referenciaPago?: string;
    lineasArticulo?: Array<{
      productId: number;
      tipo: 'venta' | 'devolucion';
      cantidad: number;
      precioUnitario: number;
      /** C-06: requerido cuando tipo='devolucion'. */
      motivo?: 'pinchado' | 'hinchado' | 'calidad' | 'otro';
      /** C-06: True = se entrega uno nuevo en el acto. Default true en el backend. */
      cambioDirecto?: boolean;
    }>;
    lineasEnvase?: Array<{ productId: number; tipo: 'prestamo' | 'devolucion'; cantidad: number }>;
  }): Promise<ClienteVisita> {
    const result = await this.request<RawClienteVisita>('/insa/api/visita', {
      method: 'POST',
      body: {
        date: params.date,
        partner_id: params.partnerId,
        resultado: params.resultado ?? null,
        ...(params.visitado !== undefined ? { visitado: params.visitado } : {}),
        cobro_efectivo: params.cobroEfectivo ?? 0,
        medio_pago: params.medioPago ?? 'efectivo',
        ...(params.referenciaPago ? { referencia_pago: params.referenciaPago } : {}),
        lineas_articulo: (params.lineasArticulo ?? []).map((l) => ({
          product_id: l.productId,
          tipo: l.tipo,
          cantidad: l.cantidad,
          precio_unitario: l.precioUnitario,
          ...(l.motivo ? { motivo: l.motivo } : {}),
          ...(l.cambioDirecto !== undefined ? { cambio_directo: l.cambioDirecto } : {}),
        })),
        lineas_envase: (params.lineasEnvase ?? []).map((l) => ({
          product_id: l.productId,
          tipo: l.tipo,
          cantidad: l.cantidad,
        })),
      },
    });

    return mapClienteVisita(result);
  }

  /**
   * Buscador exclusivo para la app móvil: busca clientes activos por nombre
   * O dirección (active=True, customer_rank > 0). `q` menor a 2 caracteres
   * devuelve `[]` sin round-trip al servidor.
   *
   * GET /insa/api/clientes/buscar-activos?q=..., response `{ clientes: [...] }`.
   */
  async buscarClientes(q: string): Promise<ClienteBusqueda[]> {
    if (q.trim().length < 2) return [];
    const result = await this.request<{
      clientes: Array<{
        partner_id: number;
        nombre: string;
        direccion: string;
        saldo_facturas: number;
        consumos: number;
        es_cliente_propio?: boolean;
        fecha_ultima_entrega?: string | null;
        fecha_ultima_cobranza?: string | null;
        fue_vencido?: boolean;
        fuc_vencido?: boolean;
        al_dia?: boolean;
        pedido_habitual?: Array<{
          product_id: number;
          producto: string;
          cantidad: number;
        }>;
        saldos_envase?: Array<{
          product_id: number;
          producto: string;
          saldo: number;
          permitido: number;
          cantidad_a_recuperar: number;
          estado_saldo?: 'debe' | 'a_favor' | 'al_dia';
        }>;
      }>;
    }>(`/insa/api/clientes/buscar-activos?q=${encodeURIComponent(q)}`);

    return result.clientes.map((c) => ({
      partnerId: c.partner_id,
      nombre: c.nombre,
      direccion: c.direccion,
      saldoFacturas: c.saldo_facturas,
      consumos: c.consumos,
      esClientePropio: c.es_cliente_propio,
      fechaUltimaEntrega: c.fecha_ultima_entrega ?? null,
      fechaUltimaCobranza: c.fecha_ultima_cobranza ?? null,
      fueVencido: c.fue_vencido ?? false,
      fucVencido: c.fuc_vencido ?? false,
      alDia: c.al_dia ?? (!c.fue_vencido && !c.fuc_vencido),
      pedidoHabitual: c.pedido_habitual?.map((p) => ({
        productId: p.product_id,
        producto: p.producto,
        cantidad: p.cantidad,
      })),
      saldosEnvase: c.saldos_envase?.map((s) => ({
        productId: s.product_id,
        producto: s.producto,
        saldo: s.saldo,
        permitido: s.permitido,
        cantidadARecuperar: s.cantidad_a_recuperar,
        estadoSaldo: s.estado_saldo,
      })),
    }));
  }

  /**
   * Verifica si ya existe un cliente con el documento (DNI / CUIT / VAT) indicado.
   * Prueba múltiples estrategias de búsqueda en backend y formatos normalizados.
   */
  async verificarDocumentoExistente(doc: string): Promise<ClienteBusqueda | null> {
    const rawDigits = doc.replace(/[\.\-\s\/]/g, '').trim();
    if (!rawDigits || rawDigits.length < 5) return null;

    // 1. Probar búsqueda por VAT específico si el backend lo soporta
    try {
      const byVat = await this.request<{
        clientes?: Array<{
          partner_id: number;
          nombre: string;
          direccion: string;
          saldo_facturas: number;
          consumos: number;
          vat?: string;
        }>;
        cliente?: {
          partner_id: number;
          nombre: string;
          direccion: string;
          saldo_facturas: number;
          consumos: number;
        };
        existe?: boolean;
      }>(`/insa/api/clientes/buscar-activos?vat=${encodeURIComponent(rawDigits)}&q=${encodeURIComponent(rawDigits)}`);

      if (byVat?.cliente) {
        return {
          partnerId: byVat.cliente.partner_id,
          nombre: byVat.cliente.nombre,
          direccion: byVat.cliente.direccion,
          saldoFacturas: byVat.cliente.saldo_facturas,
          consumos: byVat.cliente.consumos,
        };
      }
      if (byVat?.clientes && byVat.clientes.length > 0) {
        const c = byVat.clientes[0];
        return {
          partnerId: c.partner_id,
          nombre: c.nombre,
          direccion: c.direccion,
          saldoFacturas: c.saldo_facturas,
          consumos: c.consumos,
        };
      }
    } catch {
      // Ignorar fallback
    }

    // 2. Búsqueda por dígitos numéricos
    try {
      const resRaw = await this.buscarClientes(rawDigits);
      if (resRaw.length > 0) {
        return resRaw[0];
      }
    } catch {
      // Ignorar
    }

    // 3. Búsqueda por texto con formato original si contiene guiones/puntos
    if (doc.trim() !== rawDigits) {
      try {
        const resOrig = await this.buscarClientes(doc.trim());
        if (resOrig.length > 0) {
          return resOrig[0];
        }
      } catch {
        // Ignorar
      }
    }

    return null;
  }

  /**
   * Habilita a una persona física como cliente por derecho propio (Caso 3 /
   * insa_autorizacion_pedido), registrando su domicilio particular y creando
   * su fsm.location propia dedicada.
   *
   * POST /insa/api/clientes/activar-propio.
   */
  async activarClientePropio(params: ActivarClientePropioParams): Promise<ClienteBusqueda> {
    const result = await this.request<{
      partner_id: number;
      nombre: string;
      direccion: string;
      saldo_facturas: number;
      consumos: number;
      es_cliente_propio: boolean;
    }>('/insa/api/clientes/activar-propio', {
      method: 'POST',
      body: {
        partner_id: params.partnerId,
        city_id: params.cityId,
        street_id: params.streetId,
        street_number: params.streetNumber,
        floor: params.floor,
        apartment: params.apartment,
        zip: params.zip,
        notes: params.notes,
        date: params.date,
      },
    });

    return {
      partnerId: result.partner_id,
      nombre: result.nombre,
      direccion: result.direccion,
      saldoFacturas: result.saldo_facturas,
      consumos: result.consumos,
      esClientePropio: result.es_cliente_propio,
    };
  }

  /**
   * Agrega un cliente existente a la hoja de ruta del día en Odoo (fsm.route.dayroute).
   *
   * POST /insa/api/clientes/agregar-a-ruta
   */
  async agregarClienteARuta(
    date: string,
    partnerId: number,
  ): Promise<{ success: boolean; orderId?: number }> {
    const result = await this.request<{
      success: boolean;
      order_id?: number;
      partner_id?: number;
      message?: string;
    }>('/insa/api/clientes/agregar-a-ruta', {
      method: 'POST',
      body: { date, partner_id: partnerId },
    });
    return {
      success: result.success,
      orderId: result.order_id,
    };
  }

  /**
   * Quita un cliente de la hoja de ruta del día en Odoo (fsm.route.dayroute).
   *
   * POST /insa/api/clientes/quitar-de-ruta
   */
  async quitarClienteDeRuta(date: string, partnerId: number): Promise<{ success: boolean }> {
    const result = await this.request<{
      success: boolean;
      partner_id?: number;
      message?: string;
    }>('/insa/api/clientes/quitar-de-ruta', {
      method: 'POST',
      body: { date, partner_id: partnerId },
    });
    return {
      success: result.success,
    };
  }

  /**
   * Alta rápida (Paso 2.7): lista de insa.city para el picker.
   *
   * GET /insa/api/ciudades, response `{ ciudades: [...] }`.
   */
  async getCiudades(): Promise<Ciudad[]> {
    const result = await this.request<{
      ciudades: Array<{ city_id: number; nombre: string }>;
    }>('/insa/api/ciudades');

    return result.ciudades.map((c) => ({
      cityId: c.city_id,
      nombre: c.nombre,
    }));
  }

  /**
   * Calles de una ciudad puntual para el picker de alta rápida.
   *
   * GET /insa/api/calles?city_id=..., response `{ calles: [...] }`.
   */
  async getCalles(cityId: number): Promise<Calle[]> {
    const result = await this.request<{
      calles: Array<{ street_id: number; nombre: string }>;
    }>(`/insa/api/calles?city_id=${cityId}`);

    return result.calles.map((c) => ({
      streetId: c.street_id,
      nombre: c.nombre,
    }));
  }

  /**
   * Alta rápida (Paso 2.7): crea un nuevo res.partner con customer_rank=1.
   * A diferencia del formulario público (que deja el contacto como lead),
   * acá el cliente queda utilizable de inmediato (Buscador, registrar visita).
   *
   * POST /insa/api/clientes, response es el mismo shape que buscarClientes().
   */
  async crearCliente(params: CrearClienteParams): Promise<ClienteBusqueda> {
    const result = await this.request<{
      partner_id: number;
      nombre: string;
      direccion: string;
      saldo_facturas: number;
      consumos: number;
    }>('/insa/api/clientes', {
      method: 'POST',
      body: {
        nombre: params.nombre,
        city_id: params.cityId,
        street_id: params.streetId,
        street_number: params.streetNumber,
        mobile: params.mobile,
        company_type: params.tipoCliente || 'person',
        vat: params.vat,
        frecuencia_entrega: params.frecuenciaEntrega || 'semanal',
        dias_entrega: params.diasEntrega && params.diasEntrega.length > 0 ? params.diasEntrega.join(', ') : undefined,
        date: params.date,
      },
    });

    return {
      partnerId: result.partner_id,
      nombre: result.nombre,
      direccion: result.direccion,
      saldoFacturas: result.saldo_facturas,
      consumos: result.consumos,
    };
  }

  // ---------------------------------------------------------------------------
  // Catálogo
  // ---------------------------------------------------------------------------

  /**
   * Catálogo de productos para control de playa y selector de artículos/envases
   * en RegistrarVisitaDialog — filtrado server-side a visible_control_playa=True.
   *
   * GET /insa/api/catalogo, response `{ productos: [...] }`.
   */
  async getCatalogo(): Promise<ProductoCatalogo[]> {
    const result = await this.request<{
      productos: Array<{
        product_id: number;
        nombre: string;
        es_retornable: boolean;
        es_envase: boolean;
        precio?: number;
      }>;
    }>('/insa/api/catalogo');

    return result.productos.map((p) => ({
      productId: p.product_id,
      nombre: p.nombre,
      esRetornable: p.es_retornable,
      esEnvase: p.es_envase,
      precio: p.precio ?? 0,
    }));
  }

  // ---------------------------------------------------------------------------
  // Control de playa
  // ---------------------------------------------------------------------------

  /**
   * Lee los registros insa.control.playa de salida y/o entrada del día para
   * la ruta del token.
   *
   * GET /insa/api/control-playa?date=YYYY-MM-DD, response
   * `{ salida: {...} | null, entrada: {...} | null }`.
   */
  async getControlPlaya(date: string): Promise<{
    salida: ControlPlaya | null;
    entrada: ControlPlaya | null;
    totalRecaudado?: number;
    totalEfectivo?: number;
  }> {
    const result = await this.request<{
      salida: RawControlPlaya | null;
      entrada: RawControlPlaya | null;
      total_recaudado?: number;
      total_efectivo?: number;
    }>(`/insa/api/control-playa?date=${encodeURIComponent(date)}`);

    return {
      salida: result.salida ? mapControlPlaya(result.salida) : null,
      entrada: result.entrada ? mapControlPlaya(result.entrada) : null,
      totalRecaudado: result.total_recaudado ?? 0,
      totalEfectivo: result.total_efectivo ?? 0,
    };
  }

  /**
   * Crea o actualiza (upsert por tipo) el control de playa de salida o entrada.
   * Las líneas reemplazan completamente lo que había antes (misma semántica
   * que el endpoint del backend).
   *
   * C-05: `cantidadFallada` es el tercer conteo por producto (Fallados):
   *   - Salida: siempre 0 (validado por constraint en el backend).
   *   - Entrada: unidades no conformes que volvieron del reparto.
   *
   * POST /insa/api/control-playa, response es el control de playa actualizado.
   */
  async saveControlPlaya(
    date: string,
    tipo: 'salida' | 'entrada',
    kilometros: number,
    lineas: Array<{
      productId: number;
      cantidad: number;
      cantidadVacia: number;
      /** C-05: Fallados. En salida siempre 0. */
      cantidadFallada: number;
    }>,
  ): Promise<ControlPlaya> {
    const result = await this.request<RawControlPlaya>('/insa/api/control-playa', {
      method: 'POST',
      body: {
        date,
        tipo,
        kilometros,
        lineas: lineas.map((l) => ({
          product_id: l.productId,
          cantidad: l.cantidad,
          cantidad_vacia: l.cantidadVacia,
          cantidad_fallada: l.cantidadFallada,
        })),
      },
    });

    return mapControlPlaya(result);
  }

  /**
   * Aprobación del control de playa por un controlador de playa (C-08 / RN-22).
   * Segundo factor: `login`/`password` son credenciales de un res.users real
   * con insa_reparto.group_controlador — distintos de la credencial de la ruta.
   *
   * POST /insa/api/control-playa/aprobar, body `{ date, tipo, login, password }`.
   * Lanza RepartoApiError en credenciales incorrectas (401), sin permiso (400)
   * o sin control de playa previo (404).
   */
  async aprobarControlPlaya(
    date: string,
    tipo: 'salida' | 'entrada',
    login?: string,
    password?: string,
  ): Promise<ControlPlaya> {
    const result = await this.request<RawControlPlaya>('/insa/api/control-playa/aprobar', {
      method: 'POST',
      body: {
        date,
        tipo,
        ...(login && password ? { login, password } : {}),
      },
    });

    return mapControlPlaya(result);
  }

  // ---------------------------------------------------------------------------
  // Liquidación (Paso 1.9)
  // ---------------------------------------------------------------------------

  /**
   * Lee la liquidación completa de la hoja de ruta del día (Paso 1.9).
   * Solo lectura — los insa.liquidacion.* se calculan server-side al pasar
   * a 'consolidando' (action_registrar_caja). La app no escribe nada acá.
   *
   * GET /insa/api/liquidacion?date=YYYY-MM-DD.
   *
   * `disponible` es False hasta que el control de entrada esté aprobado
   * (RN-23): la liquidación no arroja resultados sin la firma del controlador.
   */
  async getLiquidacion(date: string): Promise<LiquidacionResponse> {
    const result = await this.request<{
      hoja_ruta: { id: number; date: string; state: string } | null;
      disponible: boolean;
      control_entrada_aprobado: boolean;
      tiene_diferencias: boolean;
      tiene_discordancia_fallados: boolean;
      efectivo: {
        total_registrado: number;
        efectivo_caja_repartidor: number;
        diferencia: number;
      } | null;
      articulos: Array<{
        product_id: number;
        producto: string;
        salida: number;
        entrada: number;
        teorico: number;
        registrado: number;
        diferencia: number;
      }>;
      envases: Array<{
        product_id: number;
        producto: string;
        salida: number;
        prestamos: number;
        devoluciones: number;
        entrada_teorica: number;
        entrada_real: number;
        diferencia: number;
      }>;
      fallados: Array<{
        product_id: number;
        producto: string;
        registrados: number;
        contados: number;
        discordancia: number;
      }>;
    }>(`/insa/api/liquidacion?date=${encodeURIComponent(date)}`);

    return {
      hojaRuta: result.hoja_ruta,
      disponible: result.disponible,
      controlEntradaAprobado: result.control_entrada_aprobado,
      tieneDiferencias: result.tiene_diferencias,
      tieneDiscordanciaFallados: result.tiene_discordancia_fallados,
      efectivo: result.efectivo
        ? {
            totalRegistrado: result.efectivo.total_registrado,
            efectivoCajaRepartidor: result.efectivo.efectivo_caja_repartidor,
            diferencia: result.efectivo.diferencia,
          }
        : null,
      articulos: result.articulos.map((a) => ({
        productId: a.product_id,
        producto: a.producto,
        salida: a.salida,
        entrada: a.entrada,
        teorico: a.teorico,
        registrado: a.registrado,
        diferencia: a.diferencia,
      })),
      envases: result.envases.map((e) => ({
        productId: e.product_id,
        producto: e.producto,
        salida: e.salida,
        prestamos: e.prestamos,
        devoluciones: e.devoluciones,
        entradaTeorica: e.entrada_teorica,
        entradaReal: e.entrada_real,
        diferencia: e.diferencia,
      })),
      fallados: result.fallados.map((f) => ({
        productId: f.product_id,
        producto: f.producto,
        registrados: f.registrados,
        contados: f.contados,
        discordancia: f.discordancia,
      })),
    };
  }

  // ---------------------------------------------------------------------------
  // Stock en ruta (Paso 1.11)
  // ---------------------------------------------------------------------------

  /**
   * Stock actual en el vehículo: cargado en control salida − movimientos
   * de cliente ya registrados, por producto.
   *
   * GET /insa/api/stock-en-ruta?date=YYYY-MM-DD, response `{ productos: [...] }`.
   *
   * ⚠️ Endpoint no implementado en insa_reparto todavía (ver README).
   * Devuelve 404 — StockEnRutaDialog muestra un placeholder explícito.
   */
  async getStockEnRuta(date: string): Promise<StockEnRutaItem[]> {
    const result = await this.request<{
      productos: Array<{
        product_id: number;
        nombre: string;
        disponibles: number;
        vacios: number;
        fallados: number;
        total_envases: number;
        imagen?: string | null;
      }>;
    }>(`/insa/api/stock-en-ruta?date=${encodeURIComponent(date)}`);

    return result.productos.map((p) => ({
      productId: p.product_id,
      nombre: p.nombre,
      disponibles: p.disponibles,
      vacios: p.vacios,
      fallados: p.fallados,
      totalEnvases: p.total_envases,
      imagen: p.imagen ?? null,
    }));
  }

  // ---------------------------------------------------------------------------
  // Gastos de reparto (pendiente de implementación en el backend)
  // ---------------------------------------------------------------------------

  /**
   * Lista los gastos declarados en la hoja de ruta del día.
   *
   * GET /insa/api/gastos-reparto?date=YYYY-MM-DD, response `{ gastos: [...] }`.
   *
   * ⚠️ Endpoint no implementado en insa_reparto todavía. Devuelve 404.
   * GastosDeRepartoDialog trata el 404 como lista vacía.
   */
  async getGastosDeReparto(date: string): Promise<GastoDeReparto[]> {
    const result = await this.request<{
      gastos: Array<{
        id: number;
        tipo: string;
        tipo_label: string;
        descripcion: string;
        monto: number;
        fecha: string;
      }>;
    }>(`/insa/api/gasto?date=${encodeURIComponent(date)}`);

    return (result.gastos || []).map((g) => ({
      id: g.id,
      tipo: g.tipo,
      tipoLabel: g.tipo_label || g.tipo,
      descripcion: g.descripcion || '',
      monto: g.monto ?? 0,
      fecha: g.fecha || date,
    }));
  }

  /**
   * Tipos de gasto disponibles para el selector del formulario.
   *
   * GET /insa/api/gastos-reparto/tipos, response `{ tipos: [...] }`.
   *
   * ⚠️ GastosDeRepartoDialog usa un fallback de lista fija (TIPOS_FALLBACK).
   */
  async getTiposGasto(): Promise<TipoGasto[]> {
    try {
      const result = await this.request<{ tipos: Array<{ codigo: string; label: string }> }>(
        '/insa/api/gastos-reparto/tipos',
      );
      return result.tipos.map((t) => ({ codigo: t.codigo, label: t.label }));
    } catch {
      return [];
    }
  }

  /**
   * Declara un nuevo gasto en la hoja de ruta.
   *
   * POST /insa/api/gasto, body `{ date, tipo, importe, observacion }`.
   */
  async crearGastoDeReparto(params: {
    date: string;
    tipo: string;
    descripcion: string;
    monto: number;
    comprobante?: string | null;
  }): Promise<GastoDeReparto> {
    const cleanComprobante = params.comprobante
      ? params.comprobante.replace(/^data:image\/\w+;base64,/, '')
      : false;

    const result = await this.request<{
      id: number;
      tipo: string;
      tipo_label?: string;
      descripcion?: string;
      observacion?: string;
      monto?: number;
      importe?: number;
      fecha?: string;
    }>('/insa/api/gasto', {
      method: 'POST',
      body: {
        date: params.date,
        tipo: params.tipo,
        importe: params.monto,
        observacion: params.descripcion,
        comprobante: cleanComprobante,
      },
    });

    return {
      id: result.id,
      tipo: result.tipo,
      tipoLabel: result.tipo_label || result.tipo,
      descripcion: result.descripcion || result.observacion || params.descripcion,
      monto: result.monto ?? result.importe ?? params.monto,
      fecha: result.fecha || params.date,
    };
  }

  // ---------------------------------------------------------------------------
  // Reordenar clientes
  // ---------------------------------------------------------------------------

  /**
   * Persiste el orden custom del repartidor en el backend.
   *
   * POST /insa/api/reordenar-clientes, body `{ date, partner_ids: [...] }`.
   * Returns `{ ok: true }` on success.
   *
   * ⚠️ Endpoint no implementado en insa_reparto todavía. Los callers van por
   * `queuedWrites.reordenarClientes`, que intenta red primero y encola en el
   * outbox si falla.
   */
  async reordenarClientes(date: string, partnerIds: number[]): Promise<void> {
    await this.request<{ ok: boolean }>('/insa/api/reordenar-clientes', {
      method: 'POST',
      body: { date, partner_ids: partnerIds },
    });
  }

  // ---------------------------------------------------------------------------
  // Gestión de sesión
  // ---------------------------------------------------------------------------

  /** Restaura la sesión guardada en SecureStore sin llamada de red.
   * Llamar whoami() después para confirmar que el token sigue siendo válido. */
  async restoreSession(): Promise<RepartoSession | null> {
    if (!canPersist) return null;
    const raw = await SecureStore.getItemAsync(TOKEN_STORAGE_KEY);
    if (!raw) return null;
    this.session = JSON.parse(raw) as RepartoSession;
    return this.session;
  }

  getSession(): RepartoSession | null {
    return this.session;
  }

  async logout() {
    this.session = null;
    if (canPersist) await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY);
  }
}

export const repartoApiClient = new RepartoApiClient(ODOO_BASE_URL);

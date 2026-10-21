export interface OdooConfig {
  baseUrl: string;
  db: string;
}

/** Standard Odoo external-API session (db/uid/password-or-apikey), used by
 * OdooClient's execute_kw-based methods against ordinary Odoo models. */
export interface OdooSession {
  uid: number;
  password: string; // Odoo API key for this uid
}

/**
 * insa_reparto's actual auth model (see src/api/repartoApiClient.ts and
 * controllers/insa_reparto_api.py, confirmed directly against that source):
 * one JWT-shaped credential per route/vehicle ("Reparto 01".."17",
 * `insa.repartidor.credencial`), not a real Odoo user. `login`/`numeroReparto`
 * mirror that model's own `login` (computed, email-shaped, e.g.
 * "reparto01@insareparto.local" — not a real mailbox) and its
 * backing `route_id.numero_reparto`.
 */
export interface RepartoSession {
  token: string;
  /** insa.repartidor.credencial.login, e.g. "reparto01@insareparto.local"
   * (email-shaped, not a real mailbox). */
  login: string;
  /** fsm.route id backing this credential. */
  routeId: number;
  /** fsm.route.numero_reparto, e.g. 1. */
  numeroReparto: number;
  /** Token lifetime in hours, from login()'s `expira_en_horas`. Not
   * refreshed by whoami() — only known right after a fresh login. */
  expiraEnHoras?: number;
  /** ISO datetime string (or null if never logged in before), from
   * whoami()'s `last_login`. Not present right after login(). */
  lastLogin?: string | null;
}

/**
 * The day's route sheet header, from GET /insa/api/hoja-de-ruta —
 * fsm.route.dayroute's own fields (see insa_reparto's
 * models/fsm_route_dayroute.py). `state` drives the D1 workflow
 * (borrador → en_reparto → consolidando → cerrada); only `en_reparto`
 * onward can have visits logged against it.
 */
export interface HojaDeRutaHeader {
  id: number;
  /** ISO date (YYYY-MM-DD). */
  date: string;
  state: 'borrador' | 'en_reparto' | 'consolidando' | 'cerrada';
  numeroReparto: number;
}

/**
 * Saldo de un envase retornable pendiente de recupero para un cliente.
 * Devuelto por `deuda_envases` en cada cliente de la hoja de ruta
 * (Paso 1.10 / RN 3.4 del doc D1): el repartidor lo ve antes de la visita
 * para que pueda reclamar los envases adeudados.
 */
export interface DeudaEnvase {
  productId: number;
  producto: string;
  saldo: number;
  permitido: number;
  cantidadARecuperar: number;
}

/**
 * Artículo solicitado en un pedido extra (insa.pedido.extra.linea),
 * devuelto solo en entradas con `esExtra: true` que vienen de un encargo
 * de administración (supuesto 0.3 / RN-17).
 */
export interface ArticuloSolicitado {
  productId: number;
  producto: string;
  cantidad: number;
}

/**
 * Línea del pedido habitual de un cliente (res.partner.pedido_habitual_ids).
 */
export interface PedidoHabitualItem {
  productId: number;
  producto: string;
  cantidad: number;
}

/**
 * Saldo de envases del cliente (res.partner.insa_saldo_envase_ids).
 */
export interface SaldoEnvaseItem {
  productId: number;
  producto: string;
  saldo: number;
  permitido: number;
  cantidadARecuperar: number;
  estadoSaldo?: 'debe' | 'a_favor' | 'al_dia';
}

/**
 * One client stop on the day's route sheet — a fsm.order (OCA, "scheduled
 * today") cross-referenced server-side with insa.movimiento.cliente (the
 * actual visit log, if one exists yet) for visitado/resultado/cobro state.
 *
 * `saldoFacturas`/`consumos` are real Odoo accounting fields
 * (res.partner.credit/total_invoiced — `account`/`sale` are installed).
 * `fechaUltimaEntrega`/`fechaUltimaCobranza` are dedicated computed fields
 * on res.partner (Paso 1.12), persisted and updated by a cron.
 *
 * Campos extra (C-03 / Paso 2.6):
 * - `esExtra`: cliente fuera de la ruta fija del día (buscador o alta rápida).
 * - `fueraDeRuta`: venta puntual registrada sin parada en la hoja de hoy.
 * - `pedidoExtraId`: encargo previo de administración que origina esta entrada.
 * - `deudaEnvases`: envases pendientes de recupero para este cliente.
 * - `nota` / `articulosSolicitados`: solo presentes en pedidos extra (RN-17).
 */
export interface LineaArticuloVisita {
  productId: number;
  nombre?: string;
  tipo: 'venta' | 'cambio' | 'bonif' | 'devolucion';
  cantidad: number;
  precioUnitario: number;
}

export interface LineaEnvaseVisita {
  productId: number;
  nombre?: string;
  tipo: 'prestamo' | 'devolucion';
  cantidad: number;
}

export interface ClienteVisita {
  partnerId: number;
  nombre: string;
  direccion: string;
  saldoFacturas: number;
  consumos: number;
  /** ISO date (YYYY-MM-DD), or null if no matching history was found. */
  fechaUltimaEntrega: string | null;
  /** ISO date (YYYY-MM-DD), or null if no matching history was found. */
  fechaUltimaCobranza: string | null;
  /** Whether insa.movimiento.cliente already has a visit logged for this
   * client on this hoja de ruta. */
  visitado: boolean;
  /** 'repaso' agregado en C-26: "fui y no estaba pero me dijo que volviera
   * más tarde" — el cliente sigue pendiente hasta que se resuelve el mismo día. */
  resultado: 'ausente' | 'sin_gestion' | 'repaso' | null;
  cobroEfectivo: number;
  medioPago?: 'efectivo' | 'transferencia' | 'cheque' | 'cuenta_corriente' | 'sin_transaccion';
  referenciaPago?: string;
  lineasArticulo?: LineaArticuloVisita[];
  lineasEnvase?: LineaEnvaseVisita[];
  /** RN-19's emoji icon string (✔️🛒➡️☕❗💲🔁), pre-rendered server-side. */
  iconosVisita: string;
  /** C-03: True si esta visita no proviene de la ruta fija del día
   * (cliente del buscador, alta rápida o venta puntual). */
  esExtra: boolean;
  /** C-03: si esta visita resuelve un encargo previo de administración
   * (insa.pedido.extra), su id queda acá a modo de trazabilidad. */
  pedidoExtraId: number | null;
  /** Paso 2.6: True si es una venta puntual a un cliente que no está
   * en hoja.order_ids del día (encontrado por el buscador). */
  fueraDeRuta: boolean;
  /** Paso 1.10 / RN 3.4: envases del cliente pendientes de recupero. */
  deudaEnvases: DeudaEnvase[];
  /** Solo presente en pedidos extra (supuesto 0.3 / RN-17). */
  nota?: string;
  /** Solo presente en pedidos extra con artículos solicitados. */
  articulosSolicitados?: ArticuloSolicitado[];
  /** Caso 3 / insa_autorizacion_pedido: True si la persona está habilitada
   * para pedir a nombre propio con dirección dedicada. */
  esClientePropio?: boolean;
  fueVencido?: boolean;
  fucVencido?: boolean;
  alDia?: boolean;
  pedidoHabitual?: PedidoHabitualItem[];
  saldosEnvase?: SaldoEnvaseItem[];
}

export interface HojaDeRutaResponse {
  /** null when no fsm.route.dayroute exists yet for this route+date —
   * a normal/expected state (not yet assigned), not an error. */
  hojaRuta: HojaDeRutaHeader | null;
  clientes: ClienteVisita[];
  /** Paso 2.10: umbral de saldo de facturas para marcar al cliente como
   * prioritario (FUC). Configurable en ir.config_parameter, default 30000. */
  fucUmbralSaldo: number;
  soloLectura?: boolean;
}

/** GET /insa/api/catalogo — product.template filtered server-side by
 * visible_control_playa=True (same domain insa.control.playa.linea uses). */
export interface ProductoCatalogo {
  productId: number;
  nombre: string;
  esRetornable: boolean;
  esEnvase: boolean;
  precio?: number;
}

/** GET /insa/api/ciudades — insa.city, del formulario de alta
 * (feature-formulario-alta) compartido con el web público. */
export interface Ciudad {
  cityId: number;
  nombre: string;
}

/** GET /insa/api/calles?city_id=... — insa.street de una ciudad puntual. */
export interface Calle {
  streetId: number;
  nombre: string;
}

/** GET /insa/api/clientes/buscar-activos — Buscador exclusivo para la app móvil
 * garantizando que solo devuelva clientes activos. */
export interface ClienteBusqueda {
  partnerId: number;
  nombre: string;
  direccion: string;
  saldoFacturas: number;
  consumos: number;
  /** True si la persona física ya está habilitada como cliente propio. */
  esClientePropio?: boolean;
  fechaUltimaEntrega?: string | null;
  fechaUltimaCobranza?: string | null;
  fueVencido?: boolean;
  fucVencido?: boolean;
  alDia?: boolean;
  pedidoHabitual?: PedidoHabitualItem[];
  saldosEnvase?: SaldoEnvaseItem[];
}

/** Parámetros para POST /insa/api/clientes/activar-propio. */
export interface ActivarClientePropioParams {
  partnerId: number;
  cityId: number;
  streetId: number;
  streetNumber: string;
  floor?: string;
  apartment?: string;
  zip?: string;
  notes?: string;
  date?: string;
}

export type TipoCliente = 'person' | 'company';
export type FrecuenciaEntrega = 'semanal' | 'quincenal' | 'mensual' | 'a_demanda';

/** Parámetros para POST /insa/api/clientes (Alta rápida). */
export interface CrearClienteParams {
  nombre: string;
  cityId: number;
  streetId: number;
  streetNumber: string;
  mobile?: string;
  tipoCliente?: TipoCliente;
  vat?: string;
  frecuenciaEntrega?: FrecuenciaEntrega;
  diasEntrega?: string[];
  date?: string;
}

/** One insa.control.playa.linea row.
 * C-05: tres cantidades por producto — los nombres internos del backend son
 * `cantidad` (Llenos), `cantidad_vacia` (Vacíos) y `cantidad_fallada` (Fallados).
 * En un control de SALIDA, `cantidadVacia` y `cantidadFallada` siempre son 0
 * (validado por constraint en el modelo); en ENTRADA los tres tienen sentido. */
export interface LineaControlPlaya {
  productId: number;
  producto: string;
  /** Llenos: unidades llenas / vendibles. */
  cantidad: number;
  /** Vacíos: envases vacíos que volvieron del reparto. */
  cantidadVacia: number;
  /** Fallados (C-05): producto no conforme que volvió (pinchado, hinchado,
   * falla de calidad). Cuenta para el saldo de envases pero no reingresa
   * a stock vendible. Se concilia contra las devoluciones de visitas (C-07). */
  cantidadFallada: number;
  /** Referencia mínima calculada según los pedidos habituales de la hoja de ruta. */
  aCargarPedidos?: number;
}

/** One insa.control.playa record (salida or entrada) — GET/POST
 * /insa/api/control-playa.
 *
 * `state` (C-08 / RN-22): el repartidor carga el conteo (borrador) y un
 * controlador de playa lo aprueba con sus credenciales (confirmado). Ningún
 * control queda confirmado sin esa aprobación — es la firma del segundo factor.
 *
 * `aprobado*` es el segundo factor (POST /insa/api/control-playa/aprobar):
 * un usuario real de Odoo con insa_reparto.group_controlador aprueba el
 * conteo. */
export interface ControlPlaya {
  id: number;
  tipo: 'salida' | 'entrada';
  /** C-08: 'borrador' mientras el repartidor carga el conteo;
   * 'confirmado' una vez que el controlador lo aprueba con sus credenciales. */
  state: 'borrador' | 'confirmado';
  fechaHora: string | null;
  kilometros: number;
  /** Derivado de `state === 'confirmado'` server-side. */
  aprobado: boolean;
  aprobadoPor: string | null;
  aprobadoFecha: string | null;
  lineas: LineaControlPlaya[];
}

/** Tipos de error de autenticación que el backend puede devolver.
 * Se mapean desde el mensaje de texto de la respuesta JSON
 * (el backend devuelve siempre `{ error: "<string>" }`). */
export type AuthErrorCode =
  | 'token_invalido'    // firma inválida, credencial inexistente
  | 'token_expirado'    // exp superado
  | 'sesion_revocada'   // token_version no coincide (cambio de clave / logout remoto)
  | 'credencial_bloqueada'; // demasiados intentos fallidos, bloqueado_hasta activo

/**
 * One product's stock currently on the vehicle for the route, from
 * `GET /insa/api/stock-en-ruta`. The backend derives it from the day's control
 * de playa (salida/entrada) minus the movimientos de cliente registered so far
 * — there's no dedicated Odoo field that stores a "stock en ruta" figure.
 *
 * `disponibles` can be **negative**: more units were delivered/registered than
 * the control de playa salida declared as loaded. That's a reconciliation gap
 * the repartidor needs to see, not an error to hide (the reference mockup
 * shows exactly this, `-3`).
 *
 * ⚠️ Endpoint not built on `insa_reparto` yet — see README. `StockEnRutaDialog`
 * shows a labelled placeholder until it exists.
 */
export interface StockEnRutaItem {
  productId: number;
  nombre: string;
  /** Full/usable units still on the vehicle (cargados − entregados). */
  disponibles: number;
  /** Empty returnables picked up from clients, on the vehicle. */
  vacios: number;
  /** Units flagged defective / not sellable. */
  fallados: number;
  /** Returnable containers (envases) pending reconciliation. */
  totalEnvases: number;
  /** `product.template` image — a `data:` URI or an absolute URL, or `null`
   * when the product has no image. Rendered as a thumbnail on the card. */
  imagen: string | null;
}

/** One selectable expense category for the "Declarar Nuevo Gasto" form.
 * From `GET /insa/api/gastos-reparto/tipos` (pending) — `GastosDeRepartoDialog`
 * falls back to a fixed list until that endpoint exists. */
export interface TipoGasto {
  /** Stable key sent back on create. */
  codigo: string;
  label: string;
}

/** One declared expense on the route sheet, from
 * `GET /insa/api/gastos-reparto?date=YYYY-MM-DD` (pending). */
export interface GastoDeReparto {
  id: number;
  tipo: string;
  tipoLabel: string;
  descripcion: string;
  monto: number;
  /** ISO date (YYYY-MM-DD). */
  fecha: string;
}

// ---------------------------------------------------------------------------
// Liquidación (GET /insa/api/liquidacion) — Paso 1.9
// ---------------------------------------------------------------------------

/** Una línea del cuadro de liquidación de artículos (C-16).
 * Salida − Entrada = Teórico entregado; Teórico − Registrado = Diferencia. */
export interface LiquidacionArticulo {
  productId: number;
  producto: string;
  salida: number;
  entrada: number;
  teorico: number;
  registrado: number;
  /** Positivo = falta registrar; negativo = se registró de más. */
  diferencia: number;
}

/** Una línea del cuadro de liquidación de envases (RN-07/RN-08). */
export interface LiquidacionEnvase {
  productId: number;
  producto: string;
  salida: number;
  prestamos: number;
  devoluciones: number;
  entradaTeorica: number;
  entradaReal: number;
  /** Positivo = faltan envases; negativo = sobraron. */
  diferencia: number;
}

/** Una línea del cuadro de conciliación de fallados (C-07).
 * Cruza las devoluciones cargadas en visitas contra los fallados del
 * control de playa de entrada. */
export interface LiquidacionFallado {
  productId: number;
  producto: string;
  /** Devoluciones cargadas por el repartidor en las visitas. */
  registrados: number;
  /** Fallados contados por el controlador en el control de entrada. */
  contados: number;
  /** Positivo = el repartidor registró más de lo que contó el controlador. */
  discordancia: number;
}

/**
 * Respuesta completa de GET /insa/api/liquidacion?date=YYYY-MM-DD (Paso 1.9).
 *
 * `disponible` es False hasta que el control de entrada esté aprobado
 * (RN-23 / C-08): la liquidación no arroja resultados definitivos sin la
 * firma del controlador. Si `disponible === false`, los arrays de artículos,
 * envases y fallados estarán vacíos.
 */
export interface LiquidacionResponse {
  hojaRuta: { id: number; date: string; state: string } | null;
  /** True cuando la hoja está en 'consolidando'/'cerrada' Y el control de
   * entrada fue aprobado por un controlador. */
  disponible: boolean;
  controlEntradaAprobado: boolean;
  tieneDiferencias: boolean;
  tieneDiscordanciaFallados: boolean;
  efectivo: {
    totalRegistrado: number;
    efectivoCajaRepartidor: number;
    diferencia: number;
  } | null;
  articulos: LiquidacionArticulo[];
  envases: LiquidacionEnvase[];
  fallados: LiquidacionFallado[];
}

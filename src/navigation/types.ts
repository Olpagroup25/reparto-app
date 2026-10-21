export type RootStackParamList = {
  Login: undefined;
  // Date selection now runs once, right after login, to "load" the day's
  // route data — Access and everything past it carries that date forward.
  DateSelection: { initialDate?: string } | undefined;
  Access: { deliveryDate: string };
  HojaDeRuta: { deliveryDate: string };
};

import { useQuery } from '@tanstack/react-query';
import { odooClient } from '@/examples/api/odooClient';
import { SALE_ORDERS_FORM_FIELDS } from './useSaleOrders';

// Editable fields for the create/edit contact form.
export type SaleOrderFormValues = Record<(typeof SALE_ORDERS_FORM_FIELDS)[number], string>;

export function useSaleOrder(id: number | 'new') {
    return useQuery({
        queryKey: ['sale_order', id],
        queryFn: () => odooClient.read('sale.order', [id as number], [...SALE_ORDERS_FORM_FIELDS]),
        select: (records) => records[0],
        enabled: id !== 'new',
    });
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { odooClient } from '@/examples/api/odooClient';

export const SALE_ORDERS_FORM_FIELDS = ['name', 'partner_id', 'activity_user_id'] as const;
export type SaleOrderFormValues = Record<(typeof SALE_ORDERS_FORM_FIELDS)[number], string>;

export function useSaleOrders() {
    return useQuery({
        queryKey: ['sales'],
        queryFn: () => odooClient.searchRead('sale.order', [], ['name', 'partner_id', 'activity_user_id']),
    }
    );
}
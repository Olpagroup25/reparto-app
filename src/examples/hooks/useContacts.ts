import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { odooClient } from "../api/odooClient";

export function useContacts() {
    return useQuery({
        queryKey: ['contacts'],
        queryFn: () => odooClient.searchRead('res.partner', [], ['activity_user_id', 'complete_name', 'city', 'company_name', 'avatar_128', 'email_normalized', 'phone']),
    }
    );
}

export function useArchiveContact() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (partnerId: number) =>
            odooClient.callMethod('res.partner', 'action_archive', [[partnerId]]), // generic archive method, not raw write
        onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts'] }),
    });
}

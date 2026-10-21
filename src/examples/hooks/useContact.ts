import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { odooClient } from '@/examples/api/odooClient';

// Editable fields for the create/edit contact form.
export const CONTACT_FORM_FIELDS = ['name', 'email', 'phone', 'city', 'company_name'] as const;
export type ContactFormValues = Record<(typeof CONTACT_FORM_FIELDS)[number], string>;

export function useContact(id: number | 'new') {
    return useQuery({
        queryKey: ['contacts', id],
        queryFn: () => odooClient.read('res.partner', [id as number], [...CONTACT_FORM_FIELDS]),
        select: (records) => records[0],
        enabled: id !== 'new',
    });
}

export function useCreateContact() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (values: Partial<ContactFormValues>) => odooClient.create('res.partner', values),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts'] }),
    });
}

export function useUpdateContact() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, values }: { id: number; values: Partial<ContactFormValues> }) =>
            odooClient.write('res.partner', id, values),
        onSuccess: (_result, { id }) => {
            qc.invalidateQueries({ queryKey: ['contacts'] });
            qc.invalidateQueries({ queryKey: ['contacts', id] });
        },
    });
}

export function useDeleteContact() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => odooClient.unlink('res.partner', [id]),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts'] }),
    });
}

import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import { toast } from 'sonner';

export const useUploadFile = () => {
    return useMutation({
        mutationFn: async ({ file, folder }: { file: File; folder: string }) => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', folder);

            const { data } = await apiClient.post('/storage/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return data.url;
        },
        onError: (error) => {
            console.error('File upload failed', error);
            toast.error('Failed to upload file');
        },
    });
};

export const useDeleteFile = () => {
    return useMutation({
        mutationFn: async (fileUrl: string) => {
            const { data } = await apiClient.delete('/storage/delete', {
                data: { fileUrl },
            });
            return data;
        },
        onError: (error) => {
            console.error('File deletion failed', error);
            // Non-critical, just log it usually
        },
    });
};

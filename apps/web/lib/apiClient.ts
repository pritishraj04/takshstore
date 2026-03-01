import axios from 'axios';
import { getSession } from 'next-auth/react';

export const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
});

apiClient.interceptors.request.use(
    async (config) => {
        if (typeof window !== 'undefined') {
            const session = await getSession();
            if (session && (session as any).access_token) {
                config.headers.Authorization = `Bearer ${(session as any).access_token}`;
            } else {
                const token = localStorage.getItem('token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

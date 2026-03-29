import axios, { InternalAxiosRequestConfig } from 'axios';
import { getSession, signOut } from 'next-auth/react';
import { toast } from 'sonner';
import { getApiUrl } from './api';
import { API_URL } from '@/config/env';

export const apiClient = axios.create({
    baseURL: API_URL,
});

apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        // Bulletproof URL magic: run every path through our utility to fix double /api
        if (config.url && !config.url.startsWith('http')) {
            config.url = getApiUrl(config.url);
            config.baseURL = ''; // Wipe baseURL since config.url is now absolute
        }

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

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            console.warn('Backend rejected session. Evicting user...');
            // In a browser environment, force NextAuth to destroy the session and redirect
            if (typeof window !== 'undefined') {
                toast.error('Your session has expired. Please log in again.');
                await signOut({ callbackUrl: '/login', redirect: true });
            }
        }
        return Promise.reject(error);
    }
);

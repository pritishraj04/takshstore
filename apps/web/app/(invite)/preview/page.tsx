import React from 'react';
import PreviewReceiver from '@/components/features/PreviewReceiver';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Live Preview Isolated Engine',
    description: 'Internal rendering engine for the Stitch Customizer.',
};

export default function PreviewPage() {
    // This runs completely separated from the app layout headers/footers
    // because it uses the (invite) route boundary
    return <PreviewReceiver />;
}

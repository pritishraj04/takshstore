'use client';

import React, { useEffect, useState } from 'react';
import { InviteData } from '@taksh/types';
import { getTemplate } from '../templates/TemplateRegistry';

export default function PreviewReceiver() {
    // Start with empty/null data
    const [previewData, setPreviewData] = useState<InviteData | null>(null);
    const [templateId, setTemplateId] = useState<string>('the-royal-invitation');

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            // In a real production app, verify origin here like:
            // if (event.origin !== window.location.origin) return;

            if (event.data?.type === 'UPDATE_DRAFT') {
                setPreviewData(event.data.payload);
                if (event.data.templateId) {
                    setTemplateId(event.data.templateId);
                }
            }
        };

        // Listen for messages from the parent Customizer window
        window.addEventListener('message', handleMessage);

        // Let the parent know we're ready (optional but good practice)
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({ type: 'PREVIEW_READY' }, '*');
        }

        return () => window.removeEventListener('message', handleMessage);
    }, []);

    if (!previewData) {
        return (
            <div className="min-h-screen bg-[#1a0f0f] flex items-center justify-center text-[#d4af37] font-body">
                Initializing Preview Engine...
            </div>
        );
    }

    const ActiveTemplate = getTemplate(templateId);

    // console.log('[PreviewReceiver] Rendering template:', templateId);

    return (
        <ActiveTemplate 
            key={templateId}
            data={previewData} 
            isPreviewMode={true} 
        />
    );
}

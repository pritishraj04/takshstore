import React from 'react';
import { LiveInviteTemplate } from './LiveInviteTemplate';
// Import future templates here

export const TEMPLATES: Record<string, React.ElementType> = {
    'the-royal-invitation': LiveInviteTemplate,
    // 'minimalist': MinimalistTemplate,
};

export const getTemplate = (templateId?: string) => {
    // If no templateId is provided or it's not found in the registry, fallback to the default
    if (!templateId || !TEMPLATES[templateId]) {
        return TEMPLATES['the-royal-invitation'];
    }
    return TEMPLATES[templateId];
};

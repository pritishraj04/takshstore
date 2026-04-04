import React from 'react';
import { getTemplate } from './TemplateRegistry';

interface TemplateRendererProps {
    templateId: string;
    data: any;
    isPreviewMode?: boolean;
}

export default function TemplateRenderer({ templateId, data, isPreviewMode = true }: TemplateRendererProps) {
    const ActiveTemplate = getTemplate(templateId);
    
    if (!ActiveTemplate) {
        return <div className="text-red-500 font-mono text-xs">Template "{templateId}" Not Found</div>;
    }

    return <ActiveTemplate data={data} isPreviewMode={isPreviewMode} />;
}

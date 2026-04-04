import { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { getTemplate } from '../../../../components/templates/TemplateRegistry';
import { API_URL } from '@/config/env';

interface InvitePageProps {
    params: Promise<{ slug: string }>;
}

async function getInviteData(slug: string) {
    try {
        const response = await fetch(`${API_URL}/digital-invites/${slug}`);
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        return null;
    }
}

export const viewport = {
    themeColor: '#1a0f0f',
    width: 'device-width',
    initialScale: 1.0,
};

export async function generateMetadata(
    { params }: InvitePageProps,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const resolvedParams = await params;
    const invite = await getInviteData(resolvedParams.slug);

    const baseUrl = 'https://takshstore.com';
    const currentUrl = `${baseUrl}/invites/${resolvedParams.slug}`;

    if (!invite) {
        return {
            title: 'Invitation Not Found | Taksh Store',
        };
    }

    const { inviteData } = invite;
    const couple = inviteData?.couple;
    const messages = inviteData?.messages;

    const brideName = couple?.bride?.name || 'Bride';
    const groomName = couple?.groom?.name || 'Groom';

    const name1 = couple?.primaryOrder === 'GROOM_FIRST' ? groomName : brideName;
    const name2 = couple?.primaryOrder === 'GROOM_FIRST' ? brideName : groomName;

    // Use requested title format
    const title = `${name1} Weds ${name2} | A Royal Wedding Invite`;

    // Dynamic Wedding Date for default fallback
    const weddingDate = inviteData?.wedding?.displayDate || 'the wedding date';

    // Default fallback text (approx 145-155 chars)
    const defaultDescription = `With joyful hearts, we invite you to share in our happiness as we begin our new life together. Join us for an evening of love, laughter, and celebration. Join us on ${weddingDate}.`;

    let description = messages?.socialShareText || messages?.inviteText || defaultDescription;

    // Replace [Bride] and [Groom] placeholders if they exist
    if (description.includes('[Bride]') || description.includes('[Groom]')) {
        description = description
            .replace(/\[Bride\]/g, brideName)
            .replace(/\[Groom\]/g, groomName);
    }

    // Secondary Check: If the resulting text is over the 160 character limit, 
    // or if it was the legacy long socialShareText, fallback to the cleaner default description.
    if (description.length > 160) {
        description = defaultDescription;
    }

    // Fallback to the requested social share image
    const ogImage = `${baseUrl}/themes/royal-wedding/assets/images/social-share.jpg`;

    return {
        title,
        description,
        keywords: ['wedding invitation', name1, name2, 'royal wedding', 'wedding celebration'],
        authors: [{ name: `${name1} & ${name2}` }],
        openGraph: {
            type: 'website',
            url: currentUrl,
            title,
            description,
            siteName: `${name1} & ${name2} Wedding`,
            locale: 'en_US',
            images: [
                {
                    url: ogImage,
                    width: 1200,
                    height: 630,
                    alt: `${name1} & ${name2} | A Royal Wedding Invitation`,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [ogImage],
        },
        icons: {
            icon: '/themes/royal-wedding/assets/images/favicon.png',
            apple: '/themes/royal-wedding/assets/images/apple-touch-icon.png',
        },
        other: {
            'og:image:type': 'image/jpeg',
            'twitter:url': baseUrl,
            'twitter:image:alt': `${name1} & ${name2} Wedding Invitation`,
        }
    };
}

export default async function LiveInvitePage({ params }: InvitePageProps) {
    const resolvedParams = await params;
    const invite = await getInviteData(resolvedParams.slug);

    if (!invite) {
        notFound();
    }

    const isPurchased = invite.orderItem?.order?.status === 'PAID' || invite.status === 'PUBLISHED';

    if (!isPurchased) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-primary text-white text-center p-6 bg-black">
                <h1 className="text-3xl font-serif mb-4">Invitation Not Active</h1>
                <p className="text-secondary tracking-widest uppercase text-sm">
                    This digital suite is currently in draft mode and has not been published yet.
                </p>
            </div>
        );
    }

    const { inviteData, orderItem } = invite;
    const templateId = orderItem?.product?.templateSlug || 'the-royal-invitation';
    const ActiveTemplate = getTemplate(templateId);

    return <ActiveTemplate data={inviteData} isPreviewMode={false} />;
}

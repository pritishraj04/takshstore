import { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { getTemplate } from '../../../../components/templates/TemplateRegistry';

interface InvitePageProps {
    params: Promise<{ slug: string }>;
}

async function getInviteData(slug: string) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/digital-invites/${slug}`);
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        return null;
    }
}

export async function generateMetadata(
    { params }: InvitePageProps,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const resolvedParams = await params;
    const invite = await getInviteData(resolvedParams.slug);

    if (!invite) {
        return {
            title: 'Invitation Not Found | Taksh Store',
        };
    }

    const { inviteData } = invite;
    const brideName = inviteData?.couple?.bride?.name || 'Bride';
    const groomName = inviteData?.couple?.groom?.name || 'Groom';

    const title = `${brideName} Weds ${groomName} | A Royal Wedding Invite`;
    const description = `${inviteData?.messages?.inviteText || 'Join us in celebrating our wedding.'} Join us on ${inviteData?.wedding?.displayDate || 'our special day'}.`;

    // Fallback to a default image if they haven't uploaded one yet
    const ogImage = inviteData?.couple?.image || 'https://images.unsplash.com/photo-1544078755-9a8492027b1f?auto=format&fit=crop&q=80&w=1200';
    const currentUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invites/${resolvedParams.slug}`;

    return {
        title,
        description,
        keywords: ['wedding invitation', groomName, brideName, 'royal wedding', 'wedding celebration'],
        authors: [{ name: `${groomName} & ${brideName}` }],
        openGraph: {
            type: 'website',
            url: currentUrl,
            title,
            description,
            siteName: `${brideName} & ${groomName} Wedding`,
            images: [
                {
                    url: ogImage,
                    width: 1200,
                    height: 630,
                    alt: `${brideName} & ${groomName} Wedding Invitation`,
                },
            ],
            locale: 'en_US',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [ogImage],
        },
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
    const templateId = orderItem?.product?.templateId || 'riyawedsmoon';
    const ActiveTemplate = getTemplate(templateId);

    return <ActiveTemplate data={inviteData} isPreviewMode={false} />;
}

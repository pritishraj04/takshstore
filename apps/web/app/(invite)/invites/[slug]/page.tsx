import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LiveInviteTemplate } from '../../../../components/templates/LiveInviteTemplate';

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

export async function generateMetadata({ params }: InvitePageProps): Promise<Metadata> {
    const resolvedParams = await params;
    const invite = await getInviteData(resolvedParams.slug);

    if (!invite) {
        return {
            title: 'Invite Not Found | Taksh',
            description: 'This digital invitation could not be found.',
        };
    }

    const { inviteData } = invite;
    const title = `${inviteData.couple.bride.name} & ${inviteData.couple.groom.name} | You're Invited!`;
    const description = inviteData.messages.inviteText || `Join us in celebrating the wedding of ${inviteData.couple.bride.name} and ${inviteData.couple.groom.name}.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: [inviteData.couple.image || 'https://images.unsplash.com/photo-1544078755-9a8492027b1f?auto=format&fit=crop&q=80&w=1200'],
            type: 'website',
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

    const { inviteData } = invite;

    return <LiveInviteTemplate data={inviteData} />;
}

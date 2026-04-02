import { MetadataRoute } from 'next';
import { getApiUrl } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://takshstore.com';

    // Static Routes
    const routes = [
        '',
        '/about',
        '/contacts',
        '/collection',
        '/faq',
        '/how-to-order',
        '/terms',
        '/privacy',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1.0 : 0.8,
    }));

    // Dynamic Routes: Products
    // let productRoutes: MetadataRoute.Sitemap = [];
    // try {
    //     const res = await fetch(getApiUrl('/products'), {
    //         next: { revalidate: 3600 },
    //     });

    //     if (res.ok) {
    //         const data = await res.json();
    //         productRoutes = data.map((product: any) => ({
    //             url: `${baseUrl}/collection/${product.id}`,
    //             lastModified: product.updatedAt ? new Date(product.updatedAt).toISOString() : new Date().toISOString(),
    //             changeFrequency: 'daily' as const,
    //             priority: 0.7,
    //         }));
    //     }
    // } catch (error) {
    //     console.error('Sitemap generation error (Products):', error);
    // }

    // return [...routes, ...productRoutes];
    return [...routes];
}

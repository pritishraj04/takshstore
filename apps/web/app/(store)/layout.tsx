import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import CollectionDrawer from '../../components/layout/CollectionDrawer';
import SearchOverlay from '../../components/layout/SearchOverlay';
import SmoothScroll from '../../components/animations/SmoothScroll';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
    return (
        <SmoothScroll>
            <div className="flex flex-col min-h-screen">
                <Header />
                <CollectionDrawer />
                <SearchOverlay />
                <main className="grow">{children}</main>
                <Footer />
            </div>
        </SmoothScroll>
    );
}

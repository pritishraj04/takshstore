import ArticleLayout from "@/components/features/ArticleLayout";

// A mock server fetch simulating a CMS or database retrieval
function getArticleData(slug: string) {
    return {
        slug,
        date: "MARCH 2026",
        category: "DIGITAL CRAFT",
        title: slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        author: "Taksh Studio",
        heroImage: "/main-website-assets/images/placeholder.webp",
        content: (
            <>
                <p>
                    Nulla facilisi. Integer vel arcu et dui ullamcorper fringilla sit amet et nisl. Sed imperdiet, dolor sed vehicula vulputate, odio odio dictum mauris, ac venenatis urna ex quis sem.
                </p>
                <p>
                    Donec elementum elit non ex scelerisque, vitae faucibus eros semper. Nulla nec diam eget magna pulvinar semper sed id urna. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.
                </p>
                <blockquote className="border-l-2 border-[#1A1A1A] pl-8 my-16 italic font-['var(--font-playfair)'] text-3xl text-[#1A1A1A]">
                    "We do not build templates. We engineer digital heirs to physical artistry, demanding a meticulous reverence for both code and canvas."
                </blockquote>
                <p>
                    Curabitur interdum lectus vel odio aliquam, id congue metus gravida. Aenean id vehicula ex. Vivamus sagittis enim id interdum sagittis. Nunc vitae leo ac tellus tempus aliquet. Suspendisse potenti.
                </p>
                <p>
                    Etiam dictum lectus ut orci eleifend pretium. In hac habitasse platea dictumst. Quisque facilisis odio sed orci efficitur interdum. Pellentesque nec quam viverra, sodales velit a, ultrices augue.
                </p>
            </>
        )
    };
}

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default async function InsightArticlePage({ params }: PageProps) {
    // Await params if you're using Next.js 15+ dynamic APIs, otherwise straightforward usage
    const resolvedParams = await params;
    const articleData = getArticleData(resolvedParams.slug);

    return (
        <main className="w-full flex-auto relative">
            <ArticleLayout article={articleData} />
        </main>
    );
}

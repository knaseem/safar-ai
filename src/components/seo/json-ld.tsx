export function JsonLd() {
    const organizationData = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "SafarAI",
        url: "https://safar-ai.co",
        logo: "https://safar-ai.co/logo.png",
        contactPoint: {
            "@type": "ContactPoint",
            telephone: "",
            contactType: "customer service",
        },
        sameAs: [
            "https://twitter.com/safarai",
            "https://instagram.com/safarai",
        ],
    };

    const websiteData = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "SafarAI",
        url: "https://safar-ai.co",
        potentialAction: {
            "@type": "SearchAction",
            target: "https://safar-ai.co/search?q={search_term_string}",
            "query-input": "required name=search_term_string",
        },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
            />
        </>
    );
}

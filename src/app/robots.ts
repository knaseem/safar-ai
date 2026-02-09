import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: ["/admin/", "/dashboard/", "/profile/", "/checkout/", "/api/"],
        },
        sitemap: "https://safar-ai.co/sitemap.xml",
    };
}

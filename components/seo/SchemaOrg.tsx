import type { Metadata } from "next";

import { siteConfig } from "@/config/site";

type JsonLd = Record<string, unknown>;

function jsonLdScript(data: JsonLd) {
  return {
    __html: JSON.stringify(data),
  };
}

type SchemaOrgProps = {
  type?: "default";
  metadata?: Metadata;
};

export function SchemaOrg({ type = "default", metadata }: SchemaOrgProps) {
  const url = siteConfig.url;

  const organization: JsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url,
    description: siteConfig.description,
  };

  const website: JsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url,
    name: siteConfig.name,
    potentialAction: {
      "@type": "SearchAction",
      target: `${url}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const pageTitle =
    typeof metadata?.title === "string"
      ? metadata.title
      : metadata?.title && typeof metadata.title === "object" && "absolute" in metadata.title
        ? metadata.title.absolute
        : `${siteConfig.name} — ${siteConfig.tagline}`;

  const webpage: JsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url,
    name: pageTitle,
    description: metadata?.description ?? siteConfig.description,
    isPartOf: {
      "@type": "WebSite",
      url,
      name: siteConfig.name,
    },
  };

  const data: JsonLd[] = [];

  if (type === "default") {
    data.push(organization, website, webpage);
  }

  return (
    <>
      {data.map((entry, index) => (
        <script
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={jsonLdScript(entry)}
          key={index}
          type="application/ld+json"
        />
      ))}
    </>
  );
}


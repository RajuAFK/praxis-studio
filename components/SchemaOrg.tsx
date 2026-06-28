import type { CaseStudy } from "@/lib/case-studies";

/**
 * Centralised entity description for Praxivision. Keep this identical to the
 * copy used on the home page, the studio page first paragraph, and every
 * social-profile bio — entity consistency is what makes AI tools trust who
 * we are.
 */
export const ORG = {
  legalName: "Praxivision Private Limited",
  brand: "Praxivision",
  url: "https://praxivision.com",
  logo: "https://praxivision.com/logos/praxivision.png",
  foundingDate: "1992",
  description:
    "Heritage documentation studio specialising in photogrammetry, 360° virtual tours, gaussian splatting, gigapixel imagery, and archival photography for museums, cultural institutions, and industry.",
  serviceCategories: [
    "Heritage Documentation",
    "Photogrammetry",
    "Gaussian Splatting",
    "360° Virtual Tours",
    "Gigapixel Imagery",
    "Industrial Photography",
    "Cultural Heritage Preservation",
  ],
  address: {
    street: "1-11-182, G1, Kamala Palace, Begumpet",
    locality: "Hyderabad",
    region: "Telangana",
    postal: "500016",
    country: "IN",
  },
  contact: {
    phone: "+91 94936 34192",
    email: "praxivision.info@gmail.com",
  },
} as const;

function ldScript(data: object) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationSchema() {
  return ldScript({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: ORG.brand,
    legalName: ORG.legalName,
    url: ORG.url,
    logo: ORG.logo,
    foundingDate: ORG.foundingDate,
    description: ORG.description,
    knowsAbout: ORG.serviceCategories,
    address: {
      "@type": "PostalAddress",
      streetAddress: ORG.address.street,
      addressLocality: ORG.address.locality,
      addressRegion: ORG.address.region,
      postalCode: ORG.address.postal,
      addressCountry: ORG.address.country,
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: ORG.contact.phone,
        email: ORG.contact.email,
        contactType: "customer service",
        areaServed: "Worldwide",
      },
    ],
  });
}

export function AboutPageSchema() {
  return ldScript({
    "@context": "https://schema.org",
    "@type": "AboutPage",
    url: `${ORG.url}/studio/`,
    about: {
      "@type": "Organization",
      name: ORG.brand,
      legalName: ORG.legalName,
      foundingDate: ORG.foundingDate,
      description: ORG.description,
    },
  });
}

interface ServiceBlock {
  name: string;
  description: string;
}

const SERVICE_BLOCKS: ServiceBlock[] = [
  {
    name: "Heritage Documentation",
    description:
      "Comprehensive digital documentation for heritage sites and museum collections — photogrammetry, 360° virtual tours, gaussian splats, archival photography.",
  },
  {
    name: "Gaussian Splatting",
    description:
      "Photoreal 3D capture using gaussian splatting for museums, monuments, and cultural sites. Web-deployable, real-time renderable.",
  },
  {
    name: "Photogrammetry",
    description:
      "Detailed 3D meshes for heritage objects, architectural elements, and industrial subjects. Standard 3D delivery formats.",
  },
  {
    name: "360° Virtual Tours",
    description:
      "Multi-station equirectangular capture for museums, plant walkthroughs, heritage sites, and tourism boards. Browser-deliverable.",
  },
  {
    name: "Gigapixel Imagery",
    description:
      "Robotic stitched gigapixel capture for wall prints, scientific reference, and forensic detail at any zoom.",
  },
  {
    name: "Industrial Photography",
    description:
      "On-site photography for industry, infrastructure, and institutions. Archival masters and press-ready exports.",
  },
];

export function ServiceSchemas() {
  return (
    <>
      {SERVICE_BLOCKS.map((s) =>
        <script
          key={s.name}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Service",
              serviceType: s.name,
              description: s.description,
              provider: {
                "@type": "Organization",
                name: ORG.brand,
                url: ORG.url,
              },
              areaServed: "Worldwide",
              audience: {
                "@type": "Audience",
                audienceType: "Museums and Cultural Institutions",
              },
            }),
          }}
        />
      )}
    </>
  );
}

export function CreativeWorkSchema({ study }: { study: CaseStudy }) {
  return ldScript({
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: study.title,
    description: study.summary,
    creator: {
      "@type": "Organization",
      name: ORG.brand,
      url: ORG.url,
    },
    about: study.client,
    dateCreated: study.year,
    url: `${ORG.url}/case-studies/${study.slug}/`,
  });
}

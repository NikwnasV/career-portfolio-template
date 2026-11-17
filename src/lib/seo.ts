import profile from '../data/home.json';
import projects from '../data/projects.json';
import tech from '../data/tech.json';

/** Canonical public pages, shared by robots and the build-time XML sitemap. */
export const indexablePaths = ['/', '/demos/carevisit/'];

export function projectId(title: string) {
  return 'project-' + title.toLowerCase().normalize('NFKD').replace(/[^a-z0-9\s-]/g, '').trim().replace(/[\s-]+/g, '-');
}

export function profileStructuredData(site: URL) {
  const home = site.href;
  const personId = new URL('#person', site).href;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person', '@id': personId,
        name: profile.name, url: home, jobTitle: profile.role,
        description: profile.description,
        sameAs: profile.socials.filter(social => /^https:\/\//.test(social.url)).map(social => social.url),
        knowsAbout: tech.categories.flatMap(category => category.skills.map(skill => skill.name)),
      },
      {
        '@type': 'WebSite', '@id': new URL('#website', site).href,
        name: profile.name, url: home, inLanguage: 'en',
        publisher: { '@id': personId },
      },
      {
        '@type': 'ProfilePage', '@id': new URL('#profile', site).href,
        url: home, name: profile.webpageTitle, description: profile.description,
        inLanguage: 'en', mainEntity: { '@id': personId },
        isPartOf: { '@id': new URL('#website', site).href },
        hasPart: {
          '@type': 'ItemList', name: 'Featured projects',
          numberOfItems: projects.length,
          itemListElement: projects.map((project, index) => ({
            '@type': 'ListItem', position: index + 1,
            item: { '@type': 'CreativeWork', name: project.title, description: project.description, url: new URL('#' + projectId(project.title), site).href },
          })),
        },
      },
    ],
  };
}

export function careVisitStructuredData(site: URL) {
  return {
    '@context': 'https://schema.org', '@type': 'WebPage',
    name: 'CareVisit — Interactive visitor management demo',
    description: 'A browser adaptation of a Java Swing / MySQL visitor management workflow, using fictional data for barcode check-in, check-out, staff cards and CSV export.',
    url: new URL('/demos/carevisit/', site).href, inLanguage: 'en',
    isPartOf: { '@type': 'WebSite', name: profile.name, url: site.href },
    author: { '@type': 'Person', name: profile.name, url: site.href },
  };
}

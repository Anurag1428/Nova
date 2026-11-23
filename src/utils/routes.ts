/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ActivePage = 'home' | 'treatments' | 'about';

export interface RouteState {
  page: ActivePage;
  sectionId?: string;
}

export interface PageMeta {
  title: string;
  description: string;
}

/**
 * Maps an internal page and optional section anchor to a clean SEO canonical URL path.
 */
export function pageToPath(page: ActivePage, sectionId?: string): string {
  const hashPart = sectionId ? `#${sectionId.replace(/^#/, '')}` : '';

  switch (page) {
    case 'treatments':
      return `/treatments${hashPart}`;
    case 'about':
      return `/about${hashPart}`;
    case 'home':
    default:
      return hashPart ? `/${hashPart}` : '/';
  }
}

/**
 * Resolves browser pathname and hash into internal page state and target section ID.
 * Supports clean paths (/treatments, /about) as well as legacy/fallback hash anchors.
 */
export function pathToRoute(pathname: string = '/', hash: string = ''): RouteState {
  const cleanPath = pathname.toLowerCase().replace(/\/+$/, '') || '/';
  const cleanHash = hash.replace(/^#/, '').trim();

  // 1. Direct path matching
  if (cleanPath === '/treatments') {
    return { page: 'treatments', sectionId: cleanHash || undefined };
  }

  if (cleanPath === '/about') {
    return { page: 'about', sectionId: cleanHash || undefined };
  }

  // 2. Hash-based fallback matching on root /
  if (cleanHash === 'treatments' || cleanHash.startsWith('treatments-')) {
    return { page: 'treatments', sectionId: cleanHash };
  }

  if (cleanHash === 'about' || cleanHash === 'founder' || cleanHash === 'sanctuary') {
    return { page: 'about', sectionId: cleanHash };
  }

  // 3. Default to home
  return {
    page: 'home',
    sectionId: cleanHash || undefined,
  };
}

/**
 * Provides bespoke SEO title and description metadata per page for search engines and social cards.
 */
export function getPageMeta(page: ActivePage): PageMeta {
  switch (page) {
    case 'treatments':
      return {
        title: 'Treatments & Rituals | NOVA Unisex Salon & Makeup Studio Lucknow',
        description:
          'Explore bespoke hair rituals, HydraFacials, couture bridal transformations, and luxury grooming packages at NOVA Unisex Salon in Sector 16, Vrindavan Colony, Lucknow.',
      };
    case 'about':
      return {
        title: 'The Sanctuary & Founder Story | NOVA Unisex Salon Lucknow',
        description:
          'Step inside NOVA Unisex Salon & Makeup Studio: an intimate quiet-luxury sanctuary founded on personalized consultation and clinical skin mastery in Lucknow.',
      };
    case 'home':
    default:
      return {
        title: 'NOVA Unisex Salon & Makeup Studio | Luxury Hair, Skin & Bridal Sanctuary Lucknow',
        description:
          'An immersive quiet-luxury unisex beauty salon and skin sanctuary in Vrindavan Colony, Lucknow, offering bespoke facials, hair rituals, bridal makeup, and consultations.',
      };
  }
}

/**
 * Updates document.title and meta description tags dynamically.
 */
export function updateDocumentMeta(page: ActivePage): void {
  if (typeof document === 'undefined') return;

  const meta = getPageMeta(page);
  document.title = meta.title;

  let descMeta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (!descMeta) {
    descMeta = document.createElement('meta');
    descMeta.name = 'description';
    document.head.appendChild(descMeta);
  }
  descMeta.content = meta.description;

  let ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
  if (ogTitle) ogTitle.content = meta.title;

  let ogDesc = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
  if (ogDesc) ogDesc.content = meta.description;
}

/**
 * Syncs the browser URL and history state without reloading the page.
 */
export function syncBrowserUrl(
  page: ActivePage,
  sectionId?: string,
  mode: 'push' | 'replace' = 'push'
): void {
  if (typeof window === 'undefined' || !window.history) return;

  const targetPath = pageToPath(page, sectionId);
  const currentPath =
    (window.location.pathname.replace(/\/+$/, '') || '/') +
    (window.location.hash ? window.location.hash : '');

  if (currentPath !== targetPath) {
    const state: RouteState = { page, sectionId };
    if (mode === 'push') {
      window.history.pushState(state, '', targetPath);
    } else {
      window.history.replaceState(state, '', targetPath);
    }
  }

  updateDocumentMeta(page);
}

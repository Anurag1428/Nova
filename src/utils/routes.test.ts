import test from 'node:test';
import assert from 'node:assert/strict';
import {
  pageToPath,
  pathToRoute,
  getPageMeta,
} from './routes';

test('pageToPath generates canonical clean SEO URLs', () => {
  assert.equal(pageToPath('home'), '/');
  assert.equal(pageToPath('treatments'), '/treatments');
  assert.equal(pageToPath('about'), '/about');
});

test('pageToPath retains section anchors properly', () => {
  assert.equal(pageToPath('home', 'our-approach'), '/#our-approach');
  assert.equal(pageToPath('treatments', 'hair-rituals'), '/treatments#hair-rituals');
  assert.equal(pageToPath('about', 'founder'), '/about#founder');
});

test('pathToRoute resolves clean paths into RouteState', () => {
  assert.deepEqual(pathToRoute('/', ''), { page: 'home', sectionId: undefined });
  assert.deepEqual(pathToRoute('/treatments', ''), { page: 'treatments', sectionId: undefined });
  assert.deepEqual(pathToRoute('/treatments/', ''), { page: 'treatments', sectionId: undefined });
  assert.deepEqual(pathToRoute('/about', ''), { page: 'about', sectionId: undefined });
  assert.deepEqual(pathToRoute('/about/', ''), { page: 'about', sectionId: undefined });
});

test('pathToRoute handles case-insensitivity and sub-anchors', () => {
  assert.deepEqual(pathToRoute('/TREATMENTS', '#bridal-rituals'), {
    page: 'treatments',
    sectionId: 'bridal-rituals',
  });
  assert.deepEqual(pathToRoute('/about', 'founder'), {
    page: 'about',
    sectionId: 'founder',
  });
  assert.deepEqual(pathToRoute('/', '#our-approach'), {
    page: 'home',
    sectionId: 'our-approach',
  });
});

test('pathToRoute handles legacy hash-based bookmarks gracefully', () => {
  assert.deepEqual(pathToRoute('/', '#treatments'), {
    page: 'treatments',
    sectionId: 'treatments',
  });
  assert.deepEqual(pathToRoute('/', '#about'), {
    page: 'about',
    sectionId: 'about',
  });
});

test('getPageMeta returns rich local SEO metadata with Lucknow keywords', () => {
  const homeMeta = getPageMeta('home');
  assert.ok(homeMeta.title.includes('NOVA Unisex Salon'));
  assert.ok(homeMeta.title.includes('Lucknow'));
  assert.ok(homeMeta.description.includes('Vrindavan Colony'));

  const treatmentsMeta = getPageMeta('treatments');
  assert.ok(treatmentsMeta.title.includes('Treatments & Rituals'));
  assert.ok(treatmentsMeta.description.includes('HydraFacials'));

  const aboutMeta = getPageMeta('about');
  assert.ok(aboutMeta.title.includes('Sanctuary & Founder'));
});

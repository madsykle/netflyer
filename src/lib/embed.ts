import { ContentType } from "../types/tmdb";

export type Provider =
  | 'vidplus'
  | 'vidsrc-pk'
  | 'vidsrc-icu'
  | 'vidlink'
  | 'embed-su'
  | 'vidsrc-ru'
  | 'vidsrc-su'
  | 'vidsrcme-su'
  | 'vsrc-su';

export const providerUrls: Record<Provider, (type: ContentType, id: number, s?: number, e?: number) => string> = {
  vidplus: (type, id, s, e) =>
    type === 'tv'
      ? `https://vidplus.tv/embed/tv/${id}/${s || 1}/${e || 1}`
      : `https://vidplus.tv/embed/movie/${id}`,
  'vidsrc-pk': (type, id, s, e) =>
    type === 'tv'
      ? `https://vidsrc.pk/embed/tv/${id}/${s || 1}/${e || 1}`
      : `https://vidsrc.pk/embed/movie/${id}`,
  'vidsrc-icu': (type, id, s, e) =>
    type === 'tv'
      ? `https://vidsrc.icu/embed/tv/${id}/${s || 1}/${e || 1}`
      : `https://vidsrc.icu/embed/movie/${id}`,
  vidlink: (type, id, s, e) =>
    type === 'tv'
      ? `https://vidlink.pro/tv/${id}/${s || 1}/${e || 1}`
      : `https://vidlink.pro/movie/${id}`,
  'embed-su': (type, id, s, e) =>
    type === 'tv'
      ? `https://embed.su/embed/tv/${id}/${s || 1}/${e || 1}`
      : `https://embed.su/embed/movie/${id}`,
  'vidsrc-ru': (type, id, s, e) =>
    type === 'tv'
      ? `https://vidsrc-embed.ru/embed/tv/${id}/${s || 1}-${e || 1}`
      : `https://vidsrc-embed.ru/embed/movie/${id}`,
  'vidsrc-su': (type, id, s, e) =>
    type === 'tv'
      ? `https://vidsrc-embed.su/embed/tv/${id}/${s || 1}-${e || 1}`
      : `https://vidsrc-embed.su/embed/movie/${id}`,
  'vidsrcme-su': (type, id, s, e) =>
    type === 'tv'
      ? `https://vidsrcme.su/embed/tv/${id}/${s || 1}-${e || 1}`
      : `https://vidsrcme.su/embed/movie/${id}`,
  'vsrc-su': (type, id, s, e) =>
    type === 'tv'
      ? `https://vsrc.su/embed/tv/${id}/${s || 1}-${e || 1}`
      : `https://vsrc.su/embed/movie/${id}`,
};

export const providers = [
  { key: "vidsrc-icu", label: "VidSrc ICU", description: "Default - Stable" },
  { key: "vidplus", label: "VidPlus", description: "HD Quality" },
  { key: "vidsrc-pk", label: "VidSrc PK", description: "Fast Loading" },
  { key: "vidsrc-ru", label: "Vidsrc RU", description: "Backup Source" },
  { key: "vidsrc-su", label: "Vidsrc SU", description: "Backup Source" },
  { key: "vidsrcme-su", label: "VidsrcMe", description: "Backup Source" },
  { key: "vsrc-su", label: "Vsrc SU", description: "Backup Source" },
  { key: "embed-su", label: "Embed SU", description: "Backup Source" },
];

export function getEmbedUrl(provider: Provider, type: ContentType, id: number, s?: number, e?: number): string {
  const providerFn = providerUrls[provider];
  if (!providerFn) return providerUrls['vidsrc-icu'](type, id, s, e);
  return providerFn(type, id, s, e);
}

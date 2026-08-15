import { ContentType } from "../types/tmdb";

export type Provider =
  | 'vidking'
  | 'vidsrc-pk'
  | 'vidlink'
  | 'vidsrc-ru'
  | 'vidsrc-su'
  | 'vsrc-su';

export interface StreamInfo {
  title: string;
  url: string;
  quality: string;
  language: string;
  provider: string;
  behaviorHints?: {
    notWebReady?: boolean;
    headers?: Record<string, string>;
    /**
     * For direct scraped sources: the URL the client must fetch to mint a
     * short-lived, IP-bound play token and append as `?token=` before playing.
     * (vidsrc lineage: `{stream-origin}/generate.php`.)
     */
    tokenHost?: string;
  };
}

export interface StreamsResponse {
  success: boolean;
  tmdbId: string;
  imdbId: string;
  count: number;
  streams: StreamInfo[];
}

export const providerUrls: Record<Provider, (type: ContentType, id: number, s?: number, e?: number) => string> = {
  vidking: (type, id, s, e) =>
    type === 'tv'
      ? `https://www.vidking.net/embed/tv/${id}/${s || 1}/${e || 1}?color=202833&nextEpisode=true&episodeSelector=true`
      : `https://www.vidking.net/embed/movie/${id}?color=202833&nextEpisode=true&episodeSelector=true`,
  'vidsrc-pk': (type, id, s, e) =>
    type === 'tv'
      ? `https://vidsrc.pk/embed/tv/${id}/${s || 1}/${e || 1}`
      : `https://vidsrc.pk/embed/movie/${id}`,
  vidlink: (type, id, s, e) =>
    type === 'tv'
      ? `https://vidlink.pro/tv/${id}/${s || 1}/${e || 1}`
      : `https://vidlink.pro/movie/${id}`,
  'vidsrc-ru': (type, id, s, e) =>
    type === 'tv'
      ? `https://vidsrc-embed.ru/embed/tv/${id}/${s || 1}-${e || 1}`
      : `https://vidsrc-embed.ru/embed/movie/${id}`,
  'vidsrc-su': (type, id, s, e) =>
    type === 'tv'
      ? `https://vidsrc-embed.su/embed/tv/${id}/${s || 1}-${e || 1}`
      : `https://vidsrc-embed.su/embed/movie/${id}`,
  'vsrc-su': (type, id, s, e) =>
    type === 'tv'
      ? `https://vsrc.su/embed/tv/${id}/${s || 1}-${e || 1}`
      : `https://vsrc.su/embed/movie/${id}`,
};

export const providers = [
  { key: "vidking", label: "VidKing", description: "Default - Fast & Stable" },
  { key: "vidlink", label: "VidLink", description: "Backup Source" },
  { key: "vidsrc-pk", label: "VidSrc PK", description: "Backup Source" },
  { key: "vidsrc-ru", label: "Vidsrc RU", description: "Backup Source" },
  { key: "vidsrc-su", label: "Vidsrc SU", description: "Backup Source" },
  { key: "vsrc-su", label: "Vsrc SU", description: "Backup Source" },
];

// removed tmdb-embed-api helper

export function decodeBase64Url(encoded: string): string {
  try {
    return atob(encoded.replace(/-/g, '+').replace(/_/g, '/'));
  } catch {
    return encoded;
  }
}

export function getEmbedUrl(
  provider: Provider,
  type: ContentType,
  id: number,
  s?: number,
  e?: number,
  quality?: string
): string {
  const providerFn = providerUrls[provider];
  let url = providerFn ? providerFn(type, id, s, e) : providerUrls['vidking'](type, id, s, e);

  // Pass the user's preferred quality through to embed providers that support it.
  // 'auto' (or unset) means "let the provider decide" — send nothing.
  if (quality && quality !== 'auto') {
    const sep = url.includes('?') ? '&' : '?';
    url += `${sep}quality=${encodeURIComponent(quality)}`;
  }

  return url;
}

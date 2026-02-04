import { Router, type Request, type Response, type NextFunction } from 'express';
import { ValidationError } from '../errors/index.js';
import { validateId, validateContentType, validateProvider } from '../middleware/validation.js';
import type { ContentType, Provider } from '../types/index.js';

const router = Router();

const providerUrls: Record<Provider, (type: ContentType, id: number, s?: number, e?: number) => string> = {
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

router.get('/:type/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, id } = req.params;
    const { provider = 'vidsrc-icu', s, e } = req.query;

    if (!validateContentType(type) || !validateId(id)) {
      next(new ValidationError('Invalid parameters'));
      return;
    }

    if (!validateProvider(provider as string)) {
      next(new ValidationError('Invalid provider'));
      return;
    }

    if (s && (!/^\d+$/.test(s as string) || parseInt(s as string) < 1 || parseInt(s as string) > 50)) {
      next(new ValidationError('Invalid season'));
      return;
    }

    if (e && (!/^\d+$/.test(e as string) || parseInt(e as string) < 1 || parseInt(e as string) > 100)) {
      next(new ValidationError('Invalid episode'));
      return;
    }

    const contentType = type as ContentType;
    const contentId = parseInt(id);
    const providerKey = provider as Provider;
    const season = s ? parseInt(s as string) : undefined;
    const episode = e ? parseInt(e as string) : undefined;

    const url = providerUrls[providerKey](contentType, contentId, season, episode);

    res.json({ url });
  } catch (error) {
    next(error);
  }
});

export default router;

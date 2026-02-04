import helmet from 'helmet';

export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
      scriptSrc: ["'self'"],
      imgSrc: [
        "'self'",
        'data:',
        'https:',
        'https://image.tmdb.org',
        'https://www.themoviedb.org',
      ],
      connectSrc: ["'self'", 'https://api.themoviedb.org'],
      fontSrc: ["'self'", 'https:', 'data:'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", 'https:', 'http:'],
      frameSrc: ["'self'", 'https:', 'http:'],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

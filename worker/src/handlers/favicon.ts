import type { Context } from 'hono';

// Inline SVG favicon
const FAVICON_SVG = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366f1" />
      <stop offset="100%" stop-color="#8b5cf6" />
    </linearGradient>
  </defs>
  <rect x="4" y="4" width="56" height="56" rx="12" ry="12" fill="url(#gradient)" transform="rotate(12, 32, 32)" />
  <path d="M20 40l8-8a4 4 0 014 0L44 40m-4-4l3-3a4 4 0 014 0L52 38m-12-12h.02M22 44h20a4 4 0 004-4V24a4 4 0 00-4-4H22a4 4 0 00-4 4v16a4 4 0 004 4z"
        stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none" />
</svg>`;

// 32x32 PNG favicon as base64 (for browsers that don't support SVG favicons)
const FAVICON_PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QA/wD/AP+gvaeTAAAEz0lEQVRYha2XTWxUVRSAv3Nnpv/TqZUfDZgQA1FXorEPcaEESQxqosTgxo2ttkgNEhIqFIlWEwICC1JFQjUUlF2JsJHIz4YoRh4KGhdoEEIUMaWmtB37Nz/3uJi+mTczb4ZWPZPJe/Puued859xzz3kjlJGWloFoKFS5QoR7RTVhCV0SSZzv6WkcLrduJiLBj1VaW+MbBH1bIAaSnSigovwCuIq4ItZNSf0PPT2S/N8AWluH9wm8JlNTxJuo+EH810mBi1hxwbpicbsPxi7/K4DW1qEXDHKkwOsi4+XGptYOCuqCuCGsO2mN+0FvdOC2AGtah8+BONPwOgOiRYZLgakgLtj3dx+oPxoI0Nwcn10Z1n5A/AoCAYK9nhY0lr27DtatA1HjB6iKWEdARDOeBRovGJPsJ9944NdbK7z+ZsvoeoA8ABTntgp8QH7DM4ZW3ulqv1kX9tsXFacwXOXCTcH4dLZKshpoGB+vfdIHoCLEiwDCIXh2VSWPPBqhPlaibBTIyLBy4ZskJ48mSKdKQ4dUF2YB3lgzsjCdlsZCr595vpLlT1VMy7An9TFh2coKUPjySLJkRIzRsSyAWoqOngBNSyMAdG8f59qVdMkM969bsCjE2s5qHn4swokjydwczV+HyOUcgJololq0117Yr/2aLn+0FNo7qzEGPto2kYlEg5Q7lhq2ye9yOaCai4BvvyheWDKk3lP/70Kvs1fh567eO4bCAF2rtWKQ+OKgghIEADBrjkEt3BqwWej92yfy5vjXBkC7AGGAWw0jD4o1leU88+6j9ULL+mrmL8iUkD9/t3x+aJLrVzMgtbXC0hWR7LraOmH8by3Sa6y64BUia5aUKyieROuFto0Z4yNDyvCgcvc9hrVbqlm5uoKGRuHVzVUsfy4H8MrmKurqpUhvWsy5LICQ2f9SHQ8gGs0Yv2ueof8PS3fXOLs7xzhzPJPlj6+MsHFnDXOnxj2ZO8/Q3DEFQbZ0T4TGan7KAag4ElCC/dLWkTP+ya4JRkeUdBJO9CXo2TbOwA2LmSrsv13OAdy8bpkz3/DShip8+XWxq08SAGZT22BMYFGp2u9JoXF/SK9fteztGuer40mshaZlucN1aOcEN65Z0kl/vcjsP0A4kapoMqjxwg7kNZ34sBKNCX/154wH1f50Ek71Jbj0fYoX26touFOIDymjI/Bx10ReM1PhfBbAoA+Uax4XzqZ44ukIs+Ya3tpTw0zkx7OpoiqZ+Ya/9eYYI1IZlP1elz91LMGZ40lGhjTIRqDEh5Svv0hy5mgy6FQNbj1UeTUbAVV7RdTfqfK7lk3Cyb4EJ/sSJWu/92xabVpxxZddxjB5WmAo57XPSJmXk3zj+W9FpV5Opu6zCQhgdh6YHTfIe0EKCFAQvFUzgNYCAIAdvbV7BNlXrDzYa3+OzBBaJWKLAUB0e29tO+gLwDkBLawH+SH1eT0zaHdLwX+DwoIHQGdzfLZY44SMdbDiCDgCjaWSzO9tqTEQjOqqTYdrj90WIEi2vjyxKKIpR8ERFUfgISC/gwZ47UGr8GHnpzXrCvVOG6BQ9rdppD8xtljSOIBjRBxU75MpnT7jt4zybsfh6m7JK+7/ESBIdqwejGl1RRPW3C+GCtArIa053fGZjJZa8w8h1uV7/5hnFAAAAABJRU5ErkJggg==';

export const faviconHandler = (c: Context) => {
  const path = c.req.path.toLowerCase();

  // Return SVG for .svg requests
  if (path.endsWith('.svg')) {
    return new Response(FAVICON_SVG, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  // Return PNG for .ico requests (browsers accept PNG as favicon)
  const pngBuffer = Uint8Array.from(atob(FAVICON_PNG_BASE64), c => c.charCodeAt(0));
  return new Response(pngBuffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
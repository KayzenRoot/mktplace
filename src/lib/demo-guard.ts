import 'server-only';
import { notFound } from 'next/navigation';

/** Until owner auth exists, demo routes MUST fail closed in production. */
export function requirePreviewMode() {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_PUBLIC_DEMO !== 'true') {
    notFound();
  }
}

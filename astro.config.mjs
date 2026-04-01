// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://samuelod-atmos.github.io',
  base: '/samuelod-atmos.github.io/',
  integrations: [react()]
});
# @byyuurin/uno-merge

Utility function to efficiently merge [UnoCSS](https://unocss.dev/) classes in JS without style conflicts.

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

## Installation

```bash
npm i @byyuurin/uno-merge
```

## Usage

```ts
import { createUnoMerge } from '@byyuurin/uno-merge'
import { presetWind4 } from 'unocss'

const { merge: unoMerge } = await createUnoMerge({
  presets: [
    presetWind4(),
  ],
})

unoMerge('px-2 py-1 bg-red hover:bg-dark-red p-3 bg-red-700')
// → "bg-red-700 hover:bg-dark-red p-3"
```

## Features

- Resolves conflicts between UnoCSS utility classes
- Works with arbitrary values and variants
- Supports dynamic class merging
- Supports shortcuts merging

## License

[MIT](./LICENSE) License © 2025-PRESENT [Yuurin](https://github.com/byyuurin)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/@byyuurin/uno-merge?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/@byyuurin/uno-merge
[npm-downloads-src]: https://img.shields.io/npm/dm/@byyuurin/uno-merge?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/@byyuurin/uno-merge
[bundle-src]: https://img.shields.io/bundlephobia/minzip/@byyuurin/uno-merge?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=@byyuurin/uno-merge
[license-src]: https://img.shields.io/github/license/byyuurin/uno-merge.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/byyuurin/uno-merge/blob/main/LICENSE
[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=1fa669
[jsdocs-href]: https://www.jsdocs.io/package/@byyuurin/uno-merge

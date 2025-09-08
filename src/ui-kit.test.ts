import { createCV, ct, cx } from '@byyuurin/ui-kit'
import { presetWind3, presetWind4 } from 'unocss'
import { describe, expect, it } from 'vitest'
import { createUnoMerge } from './uno-merge'

describe('combine with ui-kit', () => {
  const ui = ct({
    base: 'p-1 px-4 rounded',
    variants: {
      type: {
        outline: 'ring',
        solid: 'bg-current text-white',
      },
    },
  })

  it('cv(wind3)', async () => {
    const { merge: unoMerge } = await createUnoMerge({ presets: [presetWind3()] })
    const cv = createCV((...classValues) => unoMerge(cx(classValues)))
    const button = cv(ui)

    expect(button({ type: 'solid' }).base({ class: 'p-0' })).toMatchInlineSnapshot(`"p-0 rounded bg-current text-white"`)
    expect(button({ type: 'outline' }).base({ class: 'p-0' })).toMatchInlineSnapshot(`"p-0 rounded ring"`)
  })

  it('cv(wind4)', async () => {
    const { merge: unoMerge } = await createUnoMerge({ presets: [presetWind4()] })
    const cv = createCV((...classValues) => unoMerge(cx(classValues)))
    const button = cv(ui)

    expect(button({ type: 'solid' }).base({ class: 'p-0' })).toMatchInlineSnapshot(`"p-0 rounded bg-current text-white"`)
    expect(button({ type: 'outline' }).base({ class: 'p-0' })).toMatchInlineSnapshot(`"p-0 rounded ring"`)
  })
})

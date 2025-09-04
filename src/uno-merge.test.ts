import { createGenerator } from '@unocss/core'
import { twMerge } from 'tailwind-merge'
import { presetWind3, presetWind4 } from 'unocss'
import { describe, expect, it } from 'vitest'
import { createUnoMerge } from './uno-merge'

describe('merge', async () => {
  const unoMerge = {
    wind3: await createUnoMerge({ presets: [presetWind3()] }),
    wind4: await createUnoMerge({ presets: [presetWind4()] }),
  }

  it('tw-merge', () => {
    expect(twMerge('overflow-x-scroll overflow-y-hidden overflow-auto')).toMatchInlineSnapshot(`"overflow-auto"`)
    expect(twMerge('top-1 inset-x-2 inset-0')).toMatchInlineSnapshot(`"inset-0"`)
    expect(twMerge('gap-x-1 gap-y-2 gap-0')).toMatchInlineSnapshot(`"gap-0"`)
    expect(twMerge('pt-1 px-2 py-3 p-0')).toMatchInlineSnapshot(`"p-0"`)
    expect(twMerge('mt-1 mx-2 my-3 m-0')).toMatchInlineSnapshot(`"m-0"`)
    expect(twMerge('rounded-t-sm rounded-tr-md rounded-l-lg rounded')).toMatchInlineSnapshot(`"rounded"`)
    expect(twMerge('border-x-1 border-t-2 border')).toMatchInlineSnapshot(`"border"`)
    expect(twMerge('border-x-red-50 border-t-green-50 border-blue-100')).toMatchInlineSnapshot(`"border-blue-100"`)
    expect(twMerge('w-1 h-2 size-0')).toMatchInlineSnapshot(`"size-0"`)
    expect(twMerge('ring shadow')).toMatchInlineSnapshot(`"ring shadow"`)
    expect(twMerge('overflow-auto inline line-clamp-1')).toMatchInlineSnapshot(`"line-clamp-1"`)

    expect(twMerge('rotate-x-1 rotate-0')).toMatchInlineSnapshot(`"rotate-x-1 rotate-0"`)
    expect(twMerge('scale-x-1 scale-0')).toMatchInlineSnapshot(`"scale-x-1 scale-0"`)
    expect(twMerge('translate-x-1 translate-0')).toMatchInlineSnapshot(`"translate-0"`)
    expect(twMerge('skew-x-1 skew-0')).toMatchInlineSnapshot(`"skew-x-1 skew-0"`)
  })

  it('uno-merge(wind3)', () => {
    expect(unoMerge.wind3('overflow-x-scroll overflow-y-hidden overflow-auto')).toMatchInlineSnapshot(`"overflow-auto"`)
    expect(unoMerge.wind3('top-1 inset-x-2 inset-0')).toMatchInlineSnapshot(`"inset-0"`)
    expect(unoMerge.wind3('gap-x-1 gap-y-2 gap-0')).toMatchInlineSnapshot(`"gap-0"`)
    expect(unoMerge.wind3('pt-1 px-2 py-3 p-0')).toMatchInlineSnapshot(`"p-0"`)
    expect(unoMerge.wind3('mt-1 mx-2 my-3 m-0')).toMatchInlineSnapshot(`"m-0"`)
    expect(unoMerge.wind3('rounded-t-sm rounded-tr-md rounded-l-lg rounded')).toMatchInlineSnapshot(`"rounded"`)
    expect(unoMerge.wind3('border-x-1 border-t-2 border')).toMatchInlineSnapshot(`"border"`)
    expect(unoMerge.wind3('border-x-red-50 border-t-green-50 border-blue-100')).toMatchInlineSnapshot(`"border-blue-100"`)
    expect(unoMerge.wind3('w-1 h-2 size-0')).toMatchInlineSnapshot(`"size-0"`)
    expect(unoMerge.wind3('ring shadow')).toMatchInlineSnapshot(`"ring shadow"`)
    expect(unoMerge.wind3('overflow-auto inline line-clamp-1')).toMatchInlineSnapshot(`"line-clamp-1"`)

    expect(unoMerge.wind3('rotate-x-1 rotate-0')).toMatchInlineSnapshot(`"rotate-x-1 rotate-0"`)
    expect(unoMerge.wind3('scale-x-1 scale-0')).toMatchInlineSnapshot(`"scale-x-1 scale-0"`)
    expect(unoMerge.wind3('translate-x-1 translate-0')).toMatchInlineSnapshot(`"translate-x-1 translate-0"`)
    expect(unoMerge.wind3('skew-x-1 skew-0')).toMatchInlineSnapshot(`"skew-x-1 skew-0"`)
  })

  it('uno-merge(wind4)', () => {
    expect(unoMerge.wind4('overflow-x-scroll overflow-y-hidden overflow-auto')).toMatchInlineSnapshot(`"overflow-auto"`)
    expect(unoMerge.wind4('top-1 inset-x-2 inset-0')).toMatchInlineSnapshot(`"inset-0"`)
    expect(unoMerge.wind4('gap-x-1 gap-y-2 gap-0')).toMatchInlineSnapshot(`"gap-0"`)
    expect(unoMerge.wind4('pt-1 px-2 py-3 p-0')).toMatchInlineSnapshot(`"p-0"`)
    expect(unoMerge.wind4('mt-1 mx-2 my-3 m-0')).toMatchInlineSnapshot(`"m-0"`)
    expect(unoMerge.wind4('rounded-t-sm rounded-tr-md rounded-l-lg rounded')).toMatchInlineSnapshot(`"rounded"`)
    expect(unoMerge.wind4('border-x-1 border-t-2 border')).toMatchInlineSnapshot(`"border"`)
    expect(unoMerge.wind4('border-x-red-50 border-t-green-50 border-blue-100')).toMatchInlineSnapshot(`"border-blue-100"`)
    expect(unoMerge.wind4('w-1 h-2 size-0')).toMatchInlineSnapshot(`"size-0"`)
    expect(unoMerge.wind4('ring shadow')).toMatchInlineSnapshot(`"ring shadow"`)
    expect(unoMerge.wind4('overflow-auto inline line-clamp-1')).toMatchInlineSnapshot(`"line-clamp-1"`)

    expect(unoMerge.wind4('rotate-x-1 rotate-0')).toMatchInlineSnapshot(`"rotate-x-1 rotate-0"`)
    expect(unoMerge.wind4('scale-x-1 scale-0')).toMatchInlineSnapshot(`"scale-x-1 scale-0"`)
    expect(unoMerge.wind4('translate-x-1 translate-0')).toMatchInlineSnapshot(`"translate-x-1 translate-0"`)
    expect(unoMerge.wind4('skew-x-1 skew-0')).toMatchInlineSnapshot(`"skew-x-1 skew-0"`)
  })

  it('uno-merge(dev)', () => {
    expect(twMerge('')).toMatchInlineSnapshot(`""`)
    expect(unoMerge.wind3('')).toMatchInlineSnapshot(`""`)
    expect(unoMerge.wind4('')).toMatchInlineSnapshot(`""`)
  })

  it('uno-generator', async () => {
    const uno = await createGenerator({
      presets: [
        presetWind3(),
        // presetWind4(),
      ],
    })

    const parsed = await uno.parseToken('')

    expect(parsed?.[0][2]).toMatchInlineSnapshot(`undefined`)
  })
})

import { createGenerator } from '@unocss/core'
import { presetWind3 } from '@unocss/preset-wind3'
import { presetWind4 } from '@unocss/preset-wind4'
import { twMerge } from 'tailwind-merge'
import { describe, expect, it } from 'vitest'
import { createUnoMerge } from './uno-merge'

describe('merge', () => {
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

  it('uno-merge(wind3)', async () => {
    const unoMerge = await createUnoMerge({ presets: [presetWind3()] })

    expect(await unoMerge('overflow-x-scroll overflow-y-hidden overflow-auto')).toMatchInlineSnapshot(`"overflow-auto"`)
    expect(await unoMerge('top-1 inset-x-2 inset-0')).toMatchInlineSnapshot(`"inset-0"`)
    expect(await unoMerge('gap-x-1 gap-y-2 gap-0')).toMatchInlineSnapshot(`"gap-0"`)
    expect(await unoMerge('pt-1 px-2 py-3 p-0')).toMatchInlineSnapshot(`"p-0"`)
    expect(await unoMerge('mt-1 mx-2 my-3 m-0')).toMatchInlineSnapshot(`"m-0"`)
    expect(await unoMerge('rounded-t-sm rounded-tr-md rounded-l-lg rounded')).toMatchInlineSnapshot(`"rounded"`)
    expect(await unoMerge('border-x-1 border-t-2 border')).toMatchInlineSnapshot(`"border"`)
    expect(await unoMerge('border-x-red-50 border-t-green-50 border-blue-100')).toMatchInlineSnapshot(`"border-blue-100"`)
    expect(await unoMerge('w-1 h-2 size-0')).toMatchInlineSnapshot(`"size-0"`)
    expect(await unoMerge('ring shadow')).toMatchInlineSnapshot(`"ring shadow"`)
    expect(await unoMerge('overflow-auto inline line-clamp-1')).toMatchInlineSnapshot(`"line-clamp-1"`)

    expect(await unoMerge('rotate-x-1 rotate-0')).toMatchInlineSnapshot(`"rotate-x-1 rotate-0"`)
    expect(await unoMerge('scale-x-1 scale-0')).toMatchInlineSnapshot(`"scale-x-1 scale-0"`)
    expect(await unoMerge('translate-x-1 translate-0')).toMatchInlineSnapshot(`"translate-x-1 translate-0"`)
    expect(await unoMerge('skew-x-1 skew-0')).toMatchInlineSnapshot(`"skew-x-1 skew-0"`)
  })

  it('uno-merge(wind4)', async () => {
    const unoMerge = await createUnoMerge({ presets: [presetWind4()] })

    expect(await unoMerge('overflow-x-scroll overflow-y-hidden overflow-auto')).toMatchInlineSnapshot(`"overflow-auto"`)
    expect(await unoMerge('top-1 inset-x-2 inset-0')).toMatchInlineSnapshot(`"inset-0"`)
    expect(await unoMerge('gap-x-1 gap-y-2 gap-0')).toMatchInlineSnapshot(`"gap-0"`)
    expect(await unoMerge('pt-1 px-2 py-3 p-0')).toMatchInlineSnapshot(`"p-0"`)
    expect(await unoMerge('mt-1 mx-2 my-3 m-0')).toMatchInlineSnapshot(`"m-0"`)
    expect(await unoMerge('rounded-t-sm rounded-tr-md rounded-l-lg rounded')).toMatchInlineSnapshot(`"rounded"`)
    expect(await unoMerge('border-x-1 border-t-2 border')).toMatchInlineSnapshot(`"border"`)
    expect(await unoMerge('border-x-red-50 border-t-green-50 border-blue-100')).toMatchInlineSnapshot(`"border-blue-100"`)
    expect(await unoMerge('w-1 h-2 size-0')).toMatchInlineSnapshot(`"size-0"`)
    expect(await unoMerge('ring shadow')).toMatchInlineSnapshot(`"ring shadow"`)
    expect(await unoMerge('overflow-auto inline line-clamp-1')).toMatchInlineSnapshot(`"line-clamp-1"`)

    expect(await unoMerge('rotate-x-1 rotate-0')).toMatchInlineSnapshot(`"rotate-x-1 rotate-0"`)
    expect(await unoMerge('scale-x-1 scale-0')).toMatchInlineSnapshot(`"scale-x-1 scale-0"`)
    expect(await unoMerge('translate-x-1 translate-0')).toMatchInlineSnapshot(`"translate-x-1 translate-0"`)
    expect(await unoMerge('skew-x-1 skew-0')).toMatchInlineSnapshot(`"skew-x-1 skew-0"`)
  })

  it('uno-merge(test)', async () => {
    const unoMerge = await createUnoMerge({ presets: [presetWind4()] })

    expect(twMerge('')).toMatchInlineSnapshot(`""`)
    expect(await unoMerge('')).toMatchInlineSnapshot(`""`)
  })

  it('uno-check', async () => {
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

import { createGenerator } from '@unocss/core'
import { twMerge } from 'tailwind-merge'
import { presetWind4 } from 'unocss'
import { describe, expect, it } from 'vitest'
import { createUnoMerge } from './uno-merge'

describe('uno-merge', async () => {
  const uno = await createGenerator({
    presets: [
      presetWind4(),
    ],
    shortcuts: {
      'ui-base-1': 'text-[1.5rem] text-blue-700 font-bold',
      'ui-base-2': 'text-[2.5rem] text-red-700 font-medium',
    },
  })

  const { merge: unoMerge } = await createUnoMerge(uno.config)

  it('uno-generator', async () => {
    const tokenResult = await uno.parseToken('')

    expect(tokenResult?.filter((result) => !result[2].startsWith('@'))?.[0][2]).toMatchInlineSnapshot(`undefined`)

    expect(tokenResult?.[0][2]).toMatchInlineSnapshot(`undefined`)

    const variantResult = await uno.matchVariants('')

    expect(variantResult?.[0][2]).toMatchInlineSnapshot(`[]`)

    const input = ''
    expect(twMerge(input)).toMatchInlineSnapshot(`""`) // baseline
    expect(unoMerge(input)).toMatchInlineSnapshot(`""`)
  })

  it('overflow', () => {
    const input = 'overflow-x-scroll overflow-y-hidden overflow-auto'
    expect(twMerge(input)).toMatchInlineSnapshot(`"overflow-auto"`) // baseline
    expect(unoMerge(input)).toMatchInlineSnapshot(`"overflow-auto"`)
  })

  it('inset', () => {
    const input = 'top-1 inset-x-2 inset-0'
    expect(twMerge(input)).toMatchInlineSnapshot(`"inset-0"`) // baseline
    expect(unoMerge(input)).toMatchInlineSnapshot(`"inset-0"`)
  })

  it('gap', () => {
    const input = 'gap-x-1 gap-y-2 gap-0'
    expect(twMerge(input)).toMatchInlineSnapshot(`"gap-0"`) // baseline
    expect(unoMerge(input)).toMatchInlineSnapshot(`"gap-0"`)
  })

  it('padding', () => {
    const input = 'pt-1 px-2 py-3 p-0'
    expect(twMerge(input)).toMatchInlineSnapshot(`"p-0"`) // baseline
    expect(unoMerge(input)).toMatchInlineSnapshot(`"p-0"`)
  })

  it('margin', () => {
    const input = 'mt-1 mx-2 my-3 m-0'
    expect(twMerge(input)).toMatchInlineSnapshot(`"m-0"`) // baseline
    expect(unoMerge(input)).toMatchInlineSnapshot(`"m-0"`)
  })

  it('border', () => {
    const input = 'border-x-1 border-t-2 border'
    expect(twMerge(input)).toMatchInlineSnapshot(`"border"`) // baseline
    expect(unoMerge(input)).toMatchInlineSnapshot(`"border"`)
  })

  it('border-radius', () => {
    const input = 'rounded-t-sm rounded-tr-md rounded-l-lg rounded'
    expect(twMerge(input)).toMatchInlineSnapshot(`"rounded"`) // baseline
    expect(unoMerge(input)).toMatchInlineSnapshot(`"rounded"`)
  })

  it('border-color', () => {
    const input = 'border-x-red-50 border-t-green-50 border-blue-100'
    expect(twMerge(input)).toMatchInlineSnapshot(`"border-blue-100"`) // baseline
    expect(unoMerge(input)).toMatchInlineSnapshot(`"border-blue-100"`)
  })

  it('size', () => {
    const input = 'w-1 h-2 size-0'
    expect(twMerge(input)).toMatchInlineSnapshot(`"size-0"`) // baseline
    expect(unoMerge(input)).toMatchInlineSnapshot(`"size-0"`)
  })

  it('shadow', () => {
    const input = 'ring shadow ring-2 ring-offset-1 shadow-xs'
    expect(twMerge(input)).toMatchInlineSnapshot(`"ring-2 ring-offset-1 shadow-xs"`) // baseline
    expect(unoMerge(input)).toMatchInlineSnapshot(`"ring-2 shadow-xs ring-offset-1"`)
  })

  it('animation', () => {
    const input = 'animate-bounce animate-none'
    expect(twMerge(input)).toMatchInlineSnapshot(`"animate-none"`) // baseline
    expect(unoMerge(input)).toMatchInlineSnapshot(`"animate-none"`)
  })

  it('with important flag', () => {
    const input = 'animate-flip !animate-bounce !animate-none animate-ping!'
    expect(twMerge(input)).toMatchInlineSnapshot(`"animate-flip animate-ping!"`) // baseline
    expect(unoMerge(input)).toMatchInlineSnapshot(`"animate-flip animate-ping!"`)
  })

  it('should merge multiple style properties', () => {
    const input = 'overflow-auto inline line-clamp-1'
    expect(twMerge(input)).toMatchInlineSnapshot(`"line-clamp-1"`) // baseline
    expect(unoMerge(input)).toMatchInlineSnapshot(`"line-clamp-1"`)
  })

  it('should respect the content order', () => {
    const input = 'px-1 py-2 py-4 px-3'
    expect(twMerge(input)).toMatchInlineSnapshot(`"py-4 px-3"`) // baseline
    expect(unoMerge(input)).toMatchInlineSnapshot(`"px-3 py-4"`)
  })

  it('should merge shortcuts', () => {
    const input = 'text-6 text-green-400 font-bold ui-base-2 text-black text-8 ui-base-1'
    expect(twMerge(input)).toMatchInlineSnapshot(`"font-bold ui-base-2 text-8 ui-base-1"`) // baseline
    expect(unoMerge(input)).toMatchInlineSnapshot(`"ui-base-1"`)
  })

  it('should merge equivalent utilities and keep the latest one', () => {
    expect(unoMerge('pa-1 p-2 p3')).toMatchInlineSnapshot(`"p3"`)
  })
})

import type { ResolvedConfig, UserConfig } from '@unocss/core'
import { toEscapedSelector } from '@unocss/core'
import { createGenerator } from './generator'

const propertyNamesRE = /(?:([^:]+)):[^;]+;/g

export async function createUnoMerge<T extends UserConfig | ResolvedConfig = object>(config: T) {
  const generator = await createGenerator(config as unknown as UserConfig)
  const cache = new Map<string, { tempKey: string, variant: string, properties: string[] }>([])

  function parseToken(token: string) {
    const cachedValue = cache.get(token)

    if (cachedValue)
      return cachedValue

    const { current = '', utils } = generator.parseToken(token) ?? {}

    const tokenUtils = utils?.flat().find((result) => current && result[1]?.includes(toEscapedSelector(token)))

    const css = tokenUtils?.[2] ?? token

    let variant = token.replace(/^!|!$|\B!\b/, '').replace(current, '')

    if (/!important\b/.test(css))
      variant = `!${variant}`

    // css properties after excluding css vars
    const properties: string[] = []

    const cssProperties = css === token
      ? []
      : css.split(propertyNamesRE).filter((p) => {
          if (p && !p.startsWith('--'))
            properties.push(p)

          return Boolean(p)
        }).sort()

    cache.set(token, {
      tempKey: `${variant}${cssProperties.join(';')}`,
      variant,
      properties,
    })

    return cache.get(token)!
  }

  function merge(code: string) {
    const temp = new Map<string, string>([])
    const variantGroup = new Map<string, string[]>([])

    for (const token of code.split(/\s+/g)) {
      if (!token)
        continue

      const { variant, tempKey, properties } = parseToken(token)
      const tokenConflicting = getTokenConflicting(properties)
      const variantTokens = new Set(variantGroup.get(variant) ?? [])

      variantGroup.get(variant)
        ?.map((token) => ({ target: token, targetInfo: cache.get(token)! }))
        .forEach(({ target, targetInfo }) => {
          if (targetInfo.properties.length === 0)
            return

          if (targetInfo.properties.every((p) => tokenConflicting.includes(p))) {
            variantTokens.delete(target)
            temp.delete(targetInfo.tempKey)
          }
        })

      variantTokens.add(token)
      variantGroup.set(variant, Array.from(variantTokens))

      temp.set(tempKey, token)
    }

    return Array.from(temp.values()).filter(Boolean).join(' ')
  }

  function getConfig() {
    return generator.config
  }

  function setConfig(config: T) {
    cache.clear()
    return generator.setConfig(config as unknown as UserConfig)
  }

  return {
    merge,
    getConfig,
    setConfig,
  }
}

// https://github.com/dcastil/tailwind-merge/blob/v2.6.0/src/lib/default-config.ts#L1771
const conflictingGroups: Record<string, string[]> = {
  'overflow': ['overflow-x', 'overflow-y'],

  'overscroll-behavior': ['overscroll-behavior-x', 'overscroll-behavior-y'],

  'inset': ['left', 'right', 'top', 'bottom', 'inset-inline', 'inset-block'],
  'inset-inline': ['left', 'right'],
  'inset-block': ['top', 'bottom'],

  'gap': ['row-gap', 'column-gap'],

  'padding': [
    'padding-top',
    'padding-bottom',
    'padding-left',
    'padding-right',
    'padding-inline',
    'padding-inline-start',
    'padding-inline-end',
    'padding-block',
    'padding-block-start',
    'padding-block-end',
  ],
  'padding-inline': [
    'padding-left',
    'padding-right',
    'padding-inline-start',
    'padding-inline-end',
  ],
  'padding-block': [
    'padding-top',
    'padding-bottom',
    'padding-block-start',
    'padding-block-end',
  ],

  'margin': [
    'margin-top',
    'margin-bottom',
    'margin-left',
    'margin-right',
    'margin-inline',
    'margin-inline-start',
    'margin-inline-end',
    'margin-block',
    'margin-block-start',
    'margin-block-end',
  ],
  'margin-inline': [
    'margin-left',
    'margin-right',
    'margin-inline-start',
    'margin-inline-end',
  ],
  'margin-block': [
    'margin-top',
    'margin-bottom',
    'margin-block-start',
    'margin-block-end',
  ],

  'border-radius': [
    'border-start-start-radius',
    'border-start-end-radius',
    'border-end-end-radius',
    'border-end-start-radius',
    'border-top-left-radius',
    'border-top-right-radius',
    'border-bottom-right-radius',
    'border-bottom-left-radius',
  ],

  'border-width': [
    'border-top-width',
    'border-bottom-width',
    'border-left-width',
    'border-right-width',
    'border-inline-width',
    'border-inline-start-width',
    'border-inline-end-width',
    'border-block-width',
    'border-block-start-width',
    'border-block-end-width',
  ],
  'border-inline-width': [
    'border-left-width',
    'border-right-width',
  ],
  'border-block-width': [
    'border-top-width',
    'border-bottom-width',
  ],
  'border-color': [
    'border-top-color',
    'border-bottom-color',
    'border-left-color',
    'border-right-color',
    'border-inline-color',
    'border-inline-start-color',
    'border-inline-end-color',
    'border-block-color',
    'border-block-start-color',
    'border-block-end-color',
  ],
  'border-inline-color': [
    'border-left-color',
    'border-right-color',
  ],
  'border-block-color': [
    'border-top-color',
    'border-bottom-color',
  ],

  'scroll-margin': [
    'scroll-margin-top',
    'scroll-margin-bottom',
    'scroll-margin-left',
    'scroll-margin-right',
    'scroll-margin-inline',
    'scroll-margin-inline-start',
    'scroll-margin-inline-end',
    'scroll-margin-block',
    'scroll-margin-block-start',
    'scroll-margin-block-end',
  ],

  'scroll-padding': [
    'scroll-padding-top',
    'scroll-padding-bottom',
    'scroll-padding-left',
    'scroll-padding-right',
    'scroll-padding-inline',
    'scroll-padding-inline-start',
    'scroll-padding-inline-end',
    'scroll-padding-block',
    'scroll-padding-block-start',
    'scroll-padding-block-end',
  ],
}

export function getTokenConflicting(tokenProperties: string[]) {
  const expandProperties = tokenProperties.flatMap((p) => conflictingGroups[p]).filter(Boolean)

  if (expandProperties.length > 0) {
    return tokenProperties.length > 1
      ? [...tokenProperties, ...expandProperties]
      : expandProperties
  }

  if (tokenProperties.length > 1)
    return tokenProperties

  return []
}

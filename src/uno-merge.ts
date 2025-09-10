import type { ResolvedConfig, UserConfig } from '@unocss/core'
import { createGenerator } from './generator'

const propertyNamesRE = /(?:([^:]+)):[^;]+;/g

export async function createUnoMerge<T extends UserConfig | ResolvedConfig = object>(config: T) {
  const generator = await createGenerator(config as unknown as UserConfig)
  const cache = new Map<string, { variant: string, groupKey: string, tempKey: string, content: string }>([])

  function parseToken(token: string) {
    const cachedValue = cache.get(token)

    if (cachedValue)
      return cachedValue

    const tokenResults = generator.parseToken(token)?.filter((result) => !result[2].startsWith('@'))
    const css = tokenResults?.[0]![2] ?? token

    const variantResults = generator.matchVariants(token)

    let variant = token.replace(/^!|!$|\B!\b/, '').replace(variantResults[0]![1], '')

    if (/!important\b/.test(css))
      variant = `!${variant}`

    const content = css.replace(propertyNamesRE, '$1; ').split(/\s/).sort().join('')

    const groupKey = `${variant}${css.replace(propertyNamesRE, (_, $1) => ($1.startsWith('--')) ? '' : `${$1};`)}`
    const tempKey = `${variant}${content}`

    cache.set(token, { variant, groupKey, tempKey, content })

    return cache.get(token)!
  }

  function merge(code: string) {
    const temp = new Map<string, string>([])
    const group = new Map<string, string[]>([])

    for (const token of code.split(/\s+/g)) {
      if (!token)
        continue

      const { variant, groupKey, tempKey, content } = parseToken(token)

      if (groupKey) {
        const groupValue = group.get(groupKey) ?? []
        groupValue.push(tempKey)
        group.set(groupKey, groupValue)
      }

      const removeKeys = getConflictingKeys(content, variant)

      for (const target of removeKeys) {
        const tempKeys = group.get(target) ?? [target]
        tempKeys.forEach((tempKey) => temp.delete(tempKey))
      }

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
  'overflow': combineAffixes(['x', 'y'], { leading: 'overflow' }),

  'overscroll-behavior': combineAffixes(['x', 'y'], { leading: 'overscroll-behavior' }),

  'inset': ['left', 'right', 'top', 'bottom', 'inset-inline', 'inset-block', combineAffixesString(['left', 'right']), combineAffixesString(['top', 'bottom'])],
  'inset-inline': ['left', 'right'],
  'inset-block': ['top', 'bottom'],

  'gap': combineAffixes(['row', 'column'], { trailing: 'gap' }),

  'padding': [
    ...combineAffixes(['top', 'bottom', 'left', 'right', 'inline', 'inline-start', 'inline-end', 'block', 'block-start', 'block-end'], { leading: 'padding' }),
    combineAffixesString(['left', 'right'], { leading: 'padding' }),
    combineAffixesString(['top', 'bottom'], { leading: 'padding' }),
  ],
  'padding-inline': combineAffixes(['left', 'right', 'inline-start', 'inline-end'], { leading: 'padding' }),
  'padding-block': combineAffixes(['top', 'bottom', 'block-start', 'block-end'], { leading: 'padding' }),

  'margin': [
    ...combineAffixes(['top', 'bottom', 'left', 'right', 'inline', 'inline-start', 'inline-end', 'block', 'block-start', 'block-end'], { leading: 'margin' }),
    combineAffixesString(['left', 'right'], { leading: 'margin' }),
    combineAffixesString(['top', 'bottom'], { leading: 'margin' }),
  ],
  'margin-inline': combineAffixes(['left', 'right', 'inline-start', 'inline-end'], { leading: 'margin' }),
  'margin-block': combineAffixes(['top', 'bottom', 'block-start', 'block-end'], { leading: 'margin' }),

  'border-radius': [
    ...combineAffixes(['start-start', 'start-end', 'end-end', 'end-start', 'top-left', 'top-right', 'bottom-right', 'bottom-left'], { leading: 'border', trailing: 'radius' }),
    combineAffixesString(['end-start', 'start-start'], { leading: 'border', trailing: 'radius' }),
    combineAffixesString(['start-end', 'end-end'], { leading: 'border', trailing: 'radius' }),
    combineAffixesString(['top-left', 'top-right'], { leading: 'border', trailing: 'radius' }),
    combineAffixesString(['bottom-left', 'bottom-right'], { leading: 'border', trailing: 'radius' }),
    combineAffixesString(['top-left', 'bottom-left'], { leading: 'border', trailing: 'radius' }),
    combineAffixesString(['top-right', 'bottom-right'], { leading: 'border', trailing: 'radius' }),
  ],
  [combineAffixesString(['end-start', 'start-start'], { leading: 'border', trailing: 'radius' })]: combineAffixes(['end-start', 'start-start'], { leading: 'border', trailing: 'radius' }),

  'border-width': [
    ...combineAffixes(['top', 'bottom', 'left', 'right', 'inline', 'inline-start', 'inline-end', 'block', 'block-start', 'block-end'], { leading: 'border', trailing: 'width' }),
    combineAffixesString(['left', 'right'], { leading: 'border', trailing: 'width' }),
    combineAffixesString(['top', 'bottom'], { leading: 'border', trailing: 'width' }),
  ],
  'border-inline-width': combineAffixes(['left', 'right'], { leading: 'border', trailing: 'width' }),
  'border-block-width': combineAffixes(['top', 'bottom'], { leading: 'border', trailing: 'width' }),
  'border-color': [
    ...combineAffixes(['top', 'bottom', 'left', 'right', 'inline', 'inline-start', 'inline-end', 'block', 'block-start', 'block-end'], { leading: 'border', trailing: 'color' }),
    combineAffixesString(['left', 'right'], { leading: 'border', trailing: 'color' }),
    combineAffixesString(['top', 'bottom'], { leading: 'border', trailing: 'color' }),
  ],
  'border-inline-color': combineAffixes(['left', 'right'], { leading: 'border', trailing: 'color' }),
  'border-block-color': combineAffixes(['top', 'bottom'], { leading: 'border', trailing: 'color' }),

  'scroll-margin': [
    ...combineAffixes(['top', 'bottom', 'left', 'right', 'inline', 'inline-start', 'inline-end', 'block', 'block-start', 'block-end'], { leading: 'scroll-margin' }),
    combineAffixesString(['left', 'right'], { leading: 'scroll-margin' }),
    combineAffixesString(['top', 'bottom'], { leading: 'scroll-margin' }),
  ],

  'scroll-padding': [
    ...combineAffixes(['top', 'bottom', 'left', 'right', 'inline', 'inline-start', 'inline-end', 'block', 'block-start', 'block-end'], { leading: 'scroll-padding' }),
    combineAffixesString(['left', 'right'], { leading: 'scroll-padding' }),
    combineAffixesString(['top', 'bottom'], { leading: 'scroll-padding' }),
  ],
}

export function getConflictingKeys(content: string, variant: string) {
  const includeProperties = content.split(';').filter((c) => c && !c.startsWith('--'))

  if (includeProperties.length > 1)
    return includeProperties.map((p) => `${variant}${p};`)

  return includeProperties.flatMap((p) => {
    const properties = conflictingGroups[p] ?? []

    return properties.map((property) => `${variant}${property};`)
  })
}

interface CombineAffixesOptions {
  leading?: string
  trailing?: string
}

export function combineAffixes(
  content: string[],
  options: CombineAffixesOptions = {},
) {
  return Array.from(content)
    .sort()
    .map((s) => [options.leading, s, options.trailing].filter(Boolean).join('-'))
}

export function combineAffixesString(
  content: string[],
  options: CombineAffixesOptions = {},
) {
  return combineAffixes(content, options).join(';')
}

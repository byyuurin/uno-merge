/**
 * This file is adapted from the UnoCSS source code.
 *
 * Original source:
 * https://github.com/unocss/unocss/blob/48ea5e30f7c07ec20570688688b0993f527a057a/packages-engine/core/src/generator.ts
 *
 * Modifications:
 * 1. Retained only the parts necessary for `matchVariants` and `parseToken`
 *    (removed unused parts), and converted both functions from asynchronous to synchronous.
 * 2. Modified `parseToken` to return part of the `matchVariants` result together,
 *    to avoid calling `matchVariants` again later for that value.
 *
 * Notes:
 * - This is not an official UnoCSS file.
 * - For the full functionality, please refer to the official source.
 */

import type { Awaitable, BlocklistMeta, BlocklistValue, ControlSymbolsEntry, CSSEntries, CSSEntriesInput, CSSEntry, CSSObject, CSSValueInput, ParsedUtil, RawUtil, ResolvedConfig, Rule, RuleContext, RuleMeta, Shortcut, ShortcutInlineValue, ShortcutValue, StringifiedUtil, UserConfig, UserConfigDefaults, UtilObject, Variant, VariantContext, VariantHandlerContext, VariantMatchedResult } from '@unocss/core'
import { BetterMap, entriesToCss, expandVariantGroup, isRawUtil, isStaticShortcut, isString, noop, normalizeCSSEntries, normalizeCSSValues, notNull, resolveConfig, symbols, toArray, toEscapedSelector, TwoKeyMap, uniq, VirtualKey, warnOnce } from '@unocss/core'
import { version } from '../package.json'

interface InternalCacheValue<Theme extends object = object> {
  current: string
  utils: StringifiedUtil<Theme>[]
}

class UnoGeneratorInternal<Theme extends object = object> {
  public readonly version = version

  public config: ResolvedConfig<Theme> = undefined!
  public cache = new Map<string, InternalCacheValue<Theme> | null>()
  public blocked = new Set<string>()
  public parentOrders = new Map<string, number>()
  public activatedRules = new Set<Rule<Theme>>()

  protected constructor(
    public userConfig: UserConfig<Theme> = {},
    public defaults: UserConfigDefaults<Theme> = {},
  ) {}

  static async create<Theme extends object = object>(
    userConfig: UserConfig<Theme> = {},
    defaults: UserConfigDefaults<Theme> = {},
  ): Promise<UnoGeneratorInternal<Theme>> {
    const uno = new UnoGeneratorInternal(userConfig, defaults)
    uno.config = await resolveConfig(uno.userConfig, uno.defaults)
    return uno
  }

  async setConfig(
    userConfig?: UserConfig<Theme>,
    defaults?: UserConfigDefaults<Theme>,
  ): Promise<void> {
    if (!userConfig)
      return

    if (defaults)
      this.defaults = defaults

    this.userConfig = userConfig
    this.blocked.clear()
    this.parentOrders.clear()
    this.activatedRules.clear()
    this.cache.clear()
    this.config = await resolveConfig(userConfig, this.defaults)
  }

  makeContext(raw: string, applied: VariantMatchedResult<Theme>): RuleContext<Theme> {
    const context: RuleContext<Theme> = {
      rawSelector: raw,
      currentSelector: applied[1],
      theme: this.config.theme,
      generator: this as any,
      symbols,
      variantHandlers: applied[2],
      constructCSS: (...args) => this.constructCustomCSS(context, ...args),
      variantMatch: applied,
    }
    return context
  }

  parseToken(
    raw: string,
    alias?: string,
  ): InternalCacheValue<Theme> | undefined | null {
    if (this.blocked.has(raw))
      return

    const cacheKey = `${raw}${alias ? ` ${alias}` : ''}`

    // use caches if possible
    if (this.cache.has(cacheKey))
      return this.cache.get(cacheKey)

    const current = this.config.preprocess.reduce((acc, p) => p(acc) ?? acc, raw)

    if (this.isBlocked(current)) {
      this.blocked.add(raw)
      this.cache.set(cacheKey, null)
      return
    }

    const variantResults = this.matchVariants(raw, current)

    if (variantResults.every((i) => !i || this.isBlocked(i[1]))) {
      this.blocked.add(raw)
      this.cache.set(cacheKey, null)
      return
    }

    const handleVariantResult = (matched: VariantMatchedResult<Theme>) => {
      const context = this.makeContext(raw, [alias || matched[0], matched[1], matched[2], matched[3]])

      if (this.config.details)
        context.variants = [...matched[3]]

      // expand shortcuts
      const expanded = this.expandShortcut(context.currentSelector, context)
      const utils = expanded
        ? this.stringifyShortcuts(context.variantMatch, context, expanded[0], expanded[1])
        // no shortcuts
        : this.parseUtil(context.variantMatch, context)?.map((i) => this.stringifyUtil(i, context)).filter(notNull)

      return utils
    }

    const utils = variantResults.flatMap((i) => handleVariantResult(i)).filter((x) => !!x)

    if (utils?.length) {
      const cacheValue: InternalCacheValue<Theme> = {
        current: variantResults[0][1],
        utils,
      }

      this.cache.set(cacheKey, cacheValue)
      return cacheValue
    }

    // set null cache for unmatched result
    this.cache.set(cacheKey, null)
  }

  matchVariants(
    raw: string,
    current?: string,
  ): readonly VariantMatchedResult<Theme>[] {
    const context: VariantContext<Theme> = {
      rawSelector: raw,
      theme: this.config.theme,
      generator: this as any,
    }

    const match = (result: VariantMatchedResult<Theme>): VariantMatchedResult<Theme>[] => {
      let applied = true
      const [,, handlers, variants] = result

      while (applied) {
        applied = false
        const processed = result[1]

        for (const v of this.config.variants) {
          if (!v.multiPass && variants.has(v))
            continue

          // ignore async match function
          if (isAsyncFunction(v.match))
            continue

          let handler = v.match(processed, context)

          // ignore async handler
          if (!handler || isAsyncFunction(handler))
            continue

          if (isString(handler)) {
            if (handler === processed)
              continue

            handler = { matcher: handler }
          }

          // If variant return an array of handlers,
          // we clone the matched result and branch the matching items
          if (Array.isArray(handler)) {
            if (handler.length === 0)
              continue

            if (handler.length === 1) {
              handler = handler[0]
            }
            else {
              if (v.multiPass)
                throw new Error('multiPass can not be used together with array return variants')

              const clones = handler.map((h): VariantMatchedResult<Theme> => {
                const _processed = h.matcher ?? processed
                const _handlers = [h, ...handlers]
                const _variants = new Set(variants)
                _variants.add(v)
                return [result[0], _processed, _handlers, _variants]
              })
              return clones.flatMap((c) => match(c))
            }
          }

          result[1] = handler.matcher ?? processed
          handlers.unshift(handler)
          variants.add(v)
          applied = true
          break
        }

        if (!applied)
          break

        if (handlers.length > 500)
          throw new Error(`Too many variants applied to "${raw}"`)
      }

      return [result]
    }

    return match([
      raw,
      current || raw,
      [],
      new Set<Variant<Theme>>(),
    ])
  }

  private applyVariants(
    parsed: ParsedUtil,
    variantHandlers = parsed[4],
    raw = parsed[1],
  ): UtilObject {
    const handler = variantHandlers.slice()
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .reduceRight(
        (previous, v) => (input: VariantHandlerContext) => {
          const entries = v.body?.(input.entries) || input.entries
          const parents: [string | undefined, number | undefined] = Array.isArray(v.parent)
            ? v.parent
            : [v.parent, undefined]

          const selector = v.selector?.(input.selector, entries)

          return (v.handle ?? defaultVariantHandler)({
            ...input,
            entries,
            selector: selector || input.selector,
            parent: parents[0] || input.parent,
            parentOrder: parents[1] || input.parentOrder,
            layer: v.layer || input.layer,
            sort: v.sort || input.sort,
          }, previous)
        },
        (input: VariantHandlerContext) => input,
      )

    const variantContextResult = handler({
      prefix: '',
      selector: toEscapedSelector(raw),
      pseudo: '',
      entries: parsed[2],
    })

    const { parent, parentOrder } = variantContextResult

    if (parent != null && parentOrder != null)
      this.parentOrders.set(parent, parentOrder)

    const obj: UtilObject = {
      selector: [
        variantContextResult.prefix,
        variantContextResult.selector,
        variantContextResult.pseudo,
      ].join(''),
      entries: variantContextResult.entries,
      parent,
      layer: variantContextResult.layer,
      sort: variantContextResult.sort,
      noMerge: variantContextResult.noMerge,
    }

    for (const p of this.config.postprocess)
      p(obj)

    return obj
  }

  constructCustomCSS(
    context: Readonly<RuleContext<Theme>>,
    body: CSSObject | CSSEntries,
    overrideSelector?: string,
  ): string {
    const normalizedBody = normalizeCSSEntries(body)

    if (isString(normalizedBody))
      return normalizedBody

    const { selector, entries, parent } = this.applyVariants([0, overrideSelector || context.rawSelector, normalizedBody, undefined, context.variantHandlers])
    const cssBody = `${selector}{${entriesToCss(entries)}}`

    if (parent)
      return `${parent}{${cssBody}}`

    return cssBody
  }

  parseUtil(
    input: string | VariantMatchedResult<Theme>,
    context: RuleContext<Theme>,
    internal = false,
    shortcutPrefix?: string | string[] | undefined,
  ): (ParsedUtil | RawUtil)[] | undefined {
    const variantResults = isString(input)
      ? this.matchVariants(input)
      : [input]

    const parse = (
      [raw, processed, variantHandlers]: VariantMatchedResult<Theme>,
    ): (ParsedUtil | RawUtil)[] | undefined => {
      if (this.config.details)
        context.rules ??= []

      // Avoid context pollution in loop with await
      const scopeContext = {
        ...context,
        variantHandlers,
      }

      // use map to for static rules
      const staticMatch = this.config.rulesStaticMap[processed]

      if (staticMatch && staticMatch[1] && (internal || !staticMatch[2]?.internal))
        return this.resolveCSSResult(raw, staticMatch[1], staticMatch, scopeContext)

      // match rules
      for (const rule of this.config.rulesDynamic) {
        const [matcher, handler, meta] = rule

        // ignore internal rules
        if (meta?.internal && !internal)
          continue

        // match prefix
        let unprefixed = processed

        if (meta?.prefix) {
          const prefixes = toArray(meta.prefix)

          if (shortcutPrefix) {
            const shortcutPrefixes = toArray(shortcutPrefix)

            if (!prefixes.some((i) => shortcutPrefixes.includes(i)))
              continue
          }
          else {
            const prefix = prefixes.find((i) => processed.startsWith(i))

            if (prefix == null)
              continue

            unprefixed = processed.slice(prefix.length)
          }
        }

        // match rule
        const match = unprefixed.match(matcher)

        if (!match)
          continue

        // ignore async rules
        if (isAsyncFunction(handler))
          continue

        let result = handler(match, scopeContext)

        if (!result)
          continue

        // ignore async result
        if (isAsyncFunction(result))
          continue

        // Handle generator result
        if (typeof result !== 'string') {
          if (Symbol.asyncIterator in result)
            continue

          if (Symbol.iterator in result && !Array.isArray(result)) {
            result = Array.from(result)
              .filter(notNull)
          }
        }

        const resolvedResult = this.resolveCSSResult(raw, result, rule, scopeContext)

        if (resolvedResult)
          return resolvedResult
      }
    }

    const parsed = variantResults.flatMap((i) => parse(i)).filter((x) => !!x)

    if (parsed.length === 0)
      return undefined

    return parsed
  }

  private resolveCSSResult = (
    raw: string,
    result: CSSValueInput | string | (CSSValueInput | string)[],
    rule: Rule<Theme>,
    context: RuleContext<Theme>,
  ) => {
    const entries = normalizeCSSValues(result).filter((i) => i.length) as (string | CSSEntriesInput)[]

    if (entries.length > 0) {
      if (this.config.details)
        context.rules!.push(rule)

      context.generator.activatedRules.add(rule)
      const meta = rule[2]

      return entries.map((css): ParsedUtil | RawUtil => {
        if (isString(css))
          return [meta!.__index!, css, meta]

        // Extract variants from special symbols
        let variants = context.variantHandlers
        let entryMeta = meta

        for (const entry of css) {
          switch (entry[0]) {
            case symbols.variants:
              variants = typeof entry[1] === 'function'
                ? entry[1](variants) || variants
                : [
                    ...toArray(entry[1]),
                    ...variants,
                  ]

              break

            case symbols.parent:
              variants = [
                { parent: entry[1] },
                ...variants,
              ]

              break

            case symbols.selector:
              variants = [
                { selector: entry[1] },
                ...variants,
              ]

              break

            case symbols.layer:
              variants = [
                { layer: entry[1] },
                ...variants,
              ]

              break

            case symbols.sort:
              entryMeta = {
                ...entryMeta,
                sort: entry[1],
              }

              break

            case symbols.noMerge:
              entryMeta = {
                ...entryMeta,
                noMerge: entry[1],
              }

              break

            case symbols.body:
              (entry as unknown as CSSEntry)[0] = VirtualKey

              break

          // No default
          }
        }

        return [meta!.__index!, raw, css as CSSEntries, entryMeta, variants]
      })
    }
  }

  stringifyUtil(
    parsed?: ParsedUtil | RawUtil,
    context?: RuleContext<Theme>,
  ): StringifiedUtil<Theme> | undefined {
    if (!parsed)
      return

    if (isRawUtil(parsed))
      return [parsed[0], undefined, parsed[1], undefined, parsed[2], this.config.details ? context : undefined, undefined]

    const {
      selector,
      entries,
      parent,
      layer: variantLayer,
      sort: variantSort,
      noMerge,
    } = this.applyVariants(parsed)
    const body = entriesToCss(entries)

    if (!body)
      return

    const { layer: metaLayer, sort: metaSort, ...meta } = parsed[3] ?? {}
    const ruleMeta = {
      ...meta,
      layer: variantLayer ?? metaLayer,
      sort: variantSort ?? metaSort,
    }
    return [parsed[0], selector, body, parent, ruleMeta, this.config.details ? context : undefined, noMerge]
  }

  expandShortcut(
    input: string,
    context: RuleContext<Theme>,
    depth = 5,
  ): [(string | ShortcutInlineValue)[], RuleMeta | undefined] | undefined {
    if (depth === 0)
      return

    const recordShortcut = this.config.details
      ? (s: Shortcut<Theme>) => {
          context.shortcuts ??= []
          context.shortcuts.push(s)
        }
      : noop

    let meta: RuleMeta | undefined
    let result: string | ShortcutValue[] | undefined
    let stringResult: string[] | undefined
    let inlineResult: ShortcutInlineValue[] | undefined

    for (const s of this.config.shortcuts) {
      let unprefixed = input

      if (s[2]?.prefix) {
        const prefixes = toArray(s[2].prefix)
        const prefix = prefixes.find((i) => input.startsWith(i))

        if (prefix == null)
          continue

        unprefixed = input.slice(prefix.length)
      }

      if (isStaticShortcut(s)) {
        if (s[0] === unprefixed) {
          meta ||= s[2]
          result = s[1]
          recordShortcut(s)
          break
        }
      }
      else {
        const match = unprefixed.match(s[0])

        if (match)
          result = s[1](match, context)

        if (result) {
          meta ||= s[2]
          recordShortcut(s)
          break
        }
      }
    }

    if (result) {
      stringResult = uniq(toArray(result).filter(isString).flatMap((s) => expandVariantGroup(s.trim()).split(/\s+/g)))
      inlineResult = toArray(result).filter((i) => !isString(i)).map((i) => (<ShortcutInlineValue>{ handles: [], value: i }))
    }

    // expand nested shortcuts with variants
    if (!result) {
      const matched = isString(input) ? this.matchVariants(input) : [input]

      for (const match of matched) {
        const [raw, inputWithoutVariant, handles] = match

        if (raw !== inputWithoutVariant) {
          const expanded = this.expandShortcut(inputWithoutVariant, context, depth - 1)

          if (expanded) {
            stringResult = expanded[0].filter(isString).map((item) => raw.replace(inputWithoutVariant, item))

            inlineResult = (expanded[0].filter((i) => !isString(i)) as ShortcutInlineValue[]).map((item) => {
              return { handles: [...item.handles, ...handles], value: item.value }
            })
          }
        }
      }
    }

    if (!stringResult?.length && !inlineResult?.length)
      return

    return [
      [
        toArray(stringResult).map((s) => (this.expandShortcut(s, context, depth - 1)?.[0]) || [s]),
        inlineResult!,
      ].flat(2).filter((x) => !!x),
      meta,
    ]
  }

  stringifyShortcuts(
    parent: VariantMatchedResult<Theme>,
    context: RuleContext<Theme>,
    expanded: (string | ShortcutInlineValue)[],
    meta: RuleMeta = { layer: this.config.shortcutsLayer },
  ): StringifiedUtil<Theme>[] | undefined {
    const layerMap = new BetterMap<string | undefined, TwoKeyMap<string, string | undefined, [[CSSEntries, boolean, number][], number]>>()

    const parsed = (
      uniq(expanded)
        .flatMap((i) => {
          const result = isString(i)
            // rule
            ? this.parseUtil(i, context, true, meta.prefix) as ParsedUtil[]
            // inline CSS value in shortcut
            : [[Number.POSITIVE_INFINITY, '{inline}', normalizeCSSEntries(i.value), undefined, i.handles] as ParsedUtil]

          if (!result && this.config.warn)
            warnOnce(`unmatched utility "${i}" in shortcut "${parent[1]}"`)

          return result || []
        }))
      .filter(Boolean)
      .sort((a, b) => a[0] - b[0])

    const [raw, , parentVariants] = parent
    const rawStringifiedUtil: StringifiedUtil<Theme>[] = []

    for (const item of parsed) {
      if (isRawUtil(item)) {
        rawStringifiedUtil.push([item[0], undefined, item[1], undefined, item[2], context, undefined])
        continue
      }

      const { selector, entries, parent, sort, noMerge, layer } = this.applyVariants(item, [...item[4], ...parentVariants], raw)

      // find existing layer and merge
      const selectorMap = layerMap.getFallback(layer ?? meta.layer, new TwoKeyMap())
      // find existing selector/mediaQuery pair and merge
      const mapItem = selectorMap.getFallback(selector, parent, [[], item[0]])
      // add entries
      mapItem[0].push([entries, !!(noMerge ?? item[3]?.noMerge), sort ?? 0])
    }

    return rawStringifiedUtil.concat(layerMap
      .flatMap((selectorMap, layer) =>
        selectorMap
          .map(([e, index], selector, joinedParents) => {
            const stringify = (flatten: boolean, noMerge: boolean, entrySortPair: [CSSEntries, number][]): (StringifiedUtil<Theme> | undefined)[] => {
              const maxSort = Math.max(...entrySortPair.map((e) => e[1]))
              const entriesList = entrySortPair.map((e) => e[0])
              return (flatten ? [entriesList.flat(1)] : entriesList).map((entries: CSSEntries): StringifiedUtil<Theme> | undefined => {
                const body = entriesToCss(entries)

                if (body)
                  return [index, selector, body, joinedParents, { ...meta, noMerge, sort: maxSort, layer }, context, undefined]

                return undefined
              })
            }

            const merges = [
              [e.filter(([, noMerge]) => noMerge).map(([entries, , sort]) => [entries, sort]), true],
              [e.filter(([, noMerge]) => !noMerge).map(([entries, , sort]) => [entries, sort]), false],
            ] as [[CSSEntries, number][], boolean][]

            return merges.map(([e, noMerge]) => [
              ...stringify(false, noMerge, e.filter(([entries]) => entries.some((entry) => (entry as unknown as ControlSymbolsEntry)[0] === symbols.shortcutsNoMerge))),
              ...stringify(true, noMerge, e.filter(([entries]) => entries.every((entry) => (entry as unknown as ControlSymbolsEntry)[0] !== symbols.shortcutsNoMerge))),
            ])
          })
          .flat(2)
          .filter(Boolean) as StringifiedUtil<Theme>[]))
  }

  isBlocked(raw: string): boolean {
    return !raw || this.config.blocklist
      .map((e) => Array.isArray(e) ? e[0] : e)
      .some((e) => typeof e === 'function' ? e(raw) : isString(e) ? e === raw : e.test(raw))
  }

  getBlocked(raw: string): [BlocklistValue, BlocklistMeta | undefined] | undefined {
    const rule = this.config.blocklist
      .find((e) => {
        const v = Array.isArray(e) ? e[0] : e
        return typeof v === 'function' ? v(raw) : isString(v) ? v === raw : v.test(raw)
      })

    return rule ? (Array.isArray(rule) ? rule : [rule, undefined]) : undefined
  }
}

export class UnoGenerator<Theme extends object = object> extends UnoGeneratorInternal<Theme> {
  /**
   * @deprecated `new UnoGenerator` is deprecated, please use `createGenerator()` instead
   */
  constructor(
    userConfig: UserConfig<Theme> = {},
    defaults: UserConfigDefaults<Theme> = {},
  ) {
    super(userConfig, defaults)
    console.warn('`new UnoGenerator()` is deprecated, please use `createGenerator()` instead')
  }
}

export async function createGenerator<Theme extends object = object>(
  config?: UserConfig<Theme>,
  defaults?: UserConfigDefaults<Theme>,
): Promise<UnoGenerator<Theme>> {
  return await UnoGeneratorInternal.create(config, defaults)
}

function defaultVariantHandler(input: VariantHandlerContext, next: (input: VariantHandlerContext) => VariantHandlerContext) {
  return next(input)
}

export function isAsyncFunction<T = object>(target: Awaitable<T>): target is Promise<T> {
  if (typeof target === 'function' && target?.constructor.name === 'AsyncFunction')
    return true

  if (target instanceof Promise)
    return true

  return false
}

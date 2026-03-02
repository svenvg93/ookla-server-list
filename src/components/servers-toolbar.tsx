import { useRef, useEffect, useMemo } from 'react'
import { type Table } from '@tanstack/react-table'
import { RefreshCw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { DataTableFacetedFilter } from '@/components/data-table-faceted-filter'
import { cn, countryFlag } from '@/lib/utils'
import { type Server } from '@/lib/types'

interface ServersToolbarProps {
  table: Table<Server>
  stats: { total: number; countries: number; isps: number }
  globalFilter: string
  loading: boolean
  onRefresh: () => void
  onClearFilter: () => void
}

export function ServersToolbar({
  table, stats, globalFilter, loading, onRefresh, onClearFilter,
}: ServersToolbarProps) {
  const filterRef = useRef<HTMLInputElement>(null)
  const { pageIndex, pageSize } = table.getState().pagination
  const total = table.getFilteredRowModel().rows.length
  const from = total === 0 ? 0 : pageIndex * pageSize + 1
  const to = Math.min((pageIndex + 1) * pageSize, total)
  const ccByCountry = useMemo(() => {
    const map = new Map<string, string>()
    for (const row of table.getCoreRowModel().rows)
      if (!map.has(row.original.country)) map.set(row.original.country, row.original.cc)
    return map
  }, [table.getCoreRowModel().rows]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === '/' && !e.metaKey && !e.ctrlKey) {
        const tag = (e.target as HTMLElement).tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA') return
        e.preventDefault()
        filterRef.current?.focus()
        filterRef.current?.select()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  const activeFilters = table.getState().columnFilters
  const hasAnyFilter = activeFilters.length > 0 || !!globalFilter

  const columnLabel = (id: string) =>
    id === 'sponsor' ? 'ISP' : id === 'name' ? 'City' : 'Country'

  const removeFilterValue = (id: string, values: string[], remove: string) => {
    const remaining = values.filter(v => v !== remove)
    table.getColumn(id)?.setFilterValue(remaining.length ? remaining : undefined)
  }

  const clearAll = () => {
    table.resetColumnFilters()
    onClearFilter()
  }

  return (
    <div className="mb-3 space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          <span className="text-sm text-muted-foreground">
            Showing <strong className="text-foreground">{from}–{to}</strong> of{' '}
            <strong className="text-foreground">{total}</strong>
          </span>
          <span className="text-muted-foreground/40 select-none text-sm">·</span>
          <Badge variant="secondary" className="font-normal gap-1">
            <span className="font-semibold">{stats.countries}</span> countries
          </Badge>
          <Badge variant="secondary" className="font-normal gap-1">
            <span className="font-semibold">{stats.isps}</span> ISPs
          </Badge>
        </div>
        <DataTableFacetedFilter
          column={table.getColumn('country')}
          title="Country"
          renderOption={v => <>{countryFlag(ccByCountry.get(v) ?? '')} {v}</>}
        />
        <DataTableFacetedFilter column={table.getColumn('name')} title="City" />
        <DataTableFacetedFilter column={table.getColumn('sponsor')} title="ISP" />
        <div className="relative">
          <Input
            ref={filterRef}
            value={globalFilter}
            onChange={e => table.setGlobalFilter(e.target.value)}
            placeholder="Filter…"
            className={cn('h-9 w-40', globalFilter && 'pr-7')}
          />
          {globalFilter && (
            <button
              onClick={onClearFilter}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear filter"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <Button
          variant="outline" size="icon" className="h-9 w-9 shrink-0"
          onClick={onRefresh} disabled={loading} aria-label="Refresh"
        >
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
        </Button>
      </div>

      {hasAnyFilter && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Filtered by:</span>
          {activeFilters.flatMap(({ id, value }) => {
            const arr = value as string[]
            return arr.map(v => (
              <Badge key={`${id}-${v}`} variant="secondary" className="gap-1 pl-2 pr-1 h-6 font-normal">
                <span className="text-muted-foreground text-xs">{columnLabel(id)}:</span>
                <span className="text-xs">
                  {id === 'country' ? <>{countryFlag(ccByCountry.get(v) ?? '')} </> : null}{v}
                </span>
                <button
                  onClick={() => removeFilterValue(id, arr, v)}
                  className="ml-0.5 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={`Remove ${columnLabel(id)} filter: ${v}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))
          })}
          {globalFilter && (
            <Badge variant="secondary" className="gap-1 pl-2 pr-1 h-6 font-normal">
              <span className="text-muted-foreground text-xs">Text:</span>
              <span className="text-xs">{globalFilter}</span>
              <button
                onClick={onClearFilter}
                className="ml-0.5 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Remove text filter"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {(activeFilters.length > 1 || (activeFilters.length > 0 && globalFilter)) && (
            <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={clearAll}>
              Clear all
            </Button>
          )}
          {activeFilters.length === 1 && !globalFilter && (
            <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={clearAll}>
              Clear
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

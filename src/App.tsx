import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table'
import {
  Search, Copy, Check, ArrowUpDown, ArrowUp, ArrowDown,
  ChevronDown, Zap, X, ServerOff, RefreshCw, Play, Info,
} from 'lucide-react'
import { ModeToggle } from '@/components/mode-toggle'
import { ServerDetailSheet } from '@/components/server-detail-sheet'
import { AboutDialog } from '@/components/about-dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Server {
  id: string
  name: string
  country: string
  cc: string
  sponsor: string
  host: string
  distance: number
  https_functional: number
  preferred: number
  isp_id: string
  lat: string
  lon: string
  url: string
}

function SortButton({ label, column }: { label: string; column: import('@tanstack/react-table').Column<Server> }) {
  const sorted = column.getIsSorted()
  return (
    <Button variant="ghost" className="-ml-3 h-8" onClick={() => column.toggleSorting(sorted === 'asc')}>
      {label}
      {sorted === 'asc'  ? <ArrowUp   className="ml-1 h-3 w-3" /> :
       sorted === 'desc' ? <ArrowDown className="ml-1 h-3 w-3" /> :
                           <ArrowUpDown className="ml-1 h-3 w-3 opacity-40" />}
    </Button>
  )
}

export default function App() {
  const [allServers, setAllServers]         = useState<Server[]>([])
  const [query, setQuery]                   = useState(() => new URLSearchParams(window.location.search).get('q') ?? '')
  const [loading, setLoading]               = useState(false)
  const [error, setError]                   = useState<string | null>(null)
  const [copiedId, setCopiedId]             = useState<string | null>(null)
  const [selectedServer, setSelectedServer] = useState<Server | null>(null)
  const [aboutOpen, setAboutOpen]           = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const filterRef = useRef<HTMLInputElement>(null)

  // TanStack Table state
  const [sorting, setSorting]                   = useState<SortingState>(() => {
    const s = new URLSearchParams(window.location.search).get('sort')
    if (!s) return []
    const [id, dir] = s.split(':')
    return [{ id, desc: dir === 'desc' }]
  })
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [globalFilter, setGlobalFilter]         = useState(() => new URLSearchParams(window.location.search).get('filter') ?? '')
  const [pagination, setPagination]             = useState<PaginationState>(() => {
    const p = new URLSearchParams(window.location.search)
    return {
      pageIndex: Number(p.get('page') ?? 0),
      pageSize:  Number(p.get('size') ?? 10),
    }
  })

  const fetchServers = useCallback(async (searchQuery: string) => {
    setLoading(true)
    setError(null)
    const trimmed = searchQuery.trim()
    // Ookla API only supports single-word search; send first word, apply full query client-side
    const apiTerm = trimmed.split(/\s+/)[0] ?? ''
    try {
      const url = '/api/servers' + (apiTerm ? '?search=' + encodeURIComponent(apiTerm) : '')
      const res = await fetch(url)
      const text = await res.text()
      let data: unknown
      try { data = JSON.parse(text) }
      catch { throw new Error('Not JSON: ' + text.slice(0, 150)) }
      if (!Array.isArray(data)) {
        const msg = (data as { error?: string })?.error
        throw new Error(msg ?? 'Unexpected response format')
      }
      setAllServers(data as Server[])
      // Apply full multi-word query as client-side filter
      if (trimmed) setGlobalFilter(trimmed)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('q') ?? ''
    fetchServers(q)
  }, [fetchServers])

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

  // Sync state → URL params
  useEffect(() => {
    const params = new URLSearchParams()
    if (query)                params.set('q',      query)
    if (globalFilter)         params.set('filter', globalFilter)
    if (sorting.length > 0)   params.set('sort',   `${sorting[0].id}:${sorting[0].desc ? 'desc' : 'asc'}`)
    if (pagination.pageIndex) params.set('page',   String(pagination.pageIndex))
    if (pagination.pageSize !== 10) params.set('size', String(pagination.pageSize))
    const qs = params.toString()
    window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname)
  }, [query, globalFilter, sorting, pagination])

  function copyId(id: string) {
    navigator.clipboard.writeText(id).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 1500)
    })
  }

  function clearFilter() {
    setGlobalFilter('')
    setPagination(p => ({ ...p, pageIndex: 0 }))
  }

  const columns = useMemo<ColumnDef<Server>[]>(() => [
    {
      accessorKey: 'sponsor',
      header: ({ column }) => <SortButton label="Sponsor / ISP" column={column} />,
    },
    {
      accessorKey: 'country',
      header: ({ column }) => <SortButton label="Country" column={column} />,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <SortButton label="City" column={column} />,
      cell: ({ row }) => (
        <div>
          {row.original.preferred ? (
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-500 mr-1.5 align-middle" title="Preferred server" />
          ) : null}
          {row.getValue('name')}
        </div>
      ),
    },
    {
      accessorKey: 'host',
      header: 'Host',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">{row.getValue('host')}</span>
      ),
    },
    {
      accessorKey: 'id',
      header: ({ column }) => <SortButton label="ID" column={column} />,
      cell: ({ row }) => {
        const id: string = row.getValue('id')
        return (
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs tabular-nums">
            {id}
            <Button
              variant="outline" size="icon" className="h-6 w-6 shrink-0"
              onClick={e => { e.stopPropagation(); copyId(id) }}
            >
              {copiedId === id
                ? <Check className="h-3 w-3 text-emerald-500" />
                : <Copy className="h-3 w-3" />}
            </Button>
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: '',
      enableHiding: false,
      cell: ({ row }) => {
        const id: string = row.original.id
        return (
          <a
            href={`https://www.speedtest.net/server/${id}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
          >
            <Button variant="default" size="sm" className="h-7 gap-1.5 px-3 text-xs shrink-0">
              <Play className="h-3 w-3" />
              Run speedtest
            </Button>
          </a>
        )
      },
    },
  ], [copiedId, copyId])

  const table = useReactTable({
    data: allServers,
    columns,
    state: { sorting, columnVisibility, globalFilter, pagination },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: v => { setGlobalFilter(v); setPagination(p => ({ ...p, pageIndex: 0 })) },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const COLUMN_LABELS: Record<string, string> = {
    id: 'ID', country: 'Country', name: 'City',
    sponsor: 'Sponsor / ISP', host: 'Host',
  }

  const hasData = !loading && !error && allServers.length > 0

  // Stats for the strip
  const filteredRows = table.getFilteredRowModel().rows
  const stats = useMemo(() => {
    const servers = filteredRows.map(r => r.original)
    return {
      total: servers.length,
      countries: new Set(servers.map(s => s.cc)).size,
      isps: new Set(servers.map(s => s.sponsor)).size,
    }
  }, [filteredRows])

  return (
    <div className="min-h-screen bg-background">
      {/* Server detail sheet */}
      <ServerDetailSheet server={selectedServer} onClose={() => setSelectedServer(null)} />

      {/* About dialog */}
      <AboutDialog open={aboutOpen} onOpenChange={setAboutOpen} />

      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-8 h-14 flex items-center gap-3">
        <Zap className="h-4 w-4 text-primary shrink-0" />
        <h1 className="text-sm font-semibold tracking-tight">Speedtest Server Explorer</h1>
        <span className="text-muted-foreground/40 select-none">·</span>
        <span className="text-xs text-muted-foreground hidden sm:block">Browse servers by ISP, operator or city</span>
        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost" size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => setAboutOpen(true)}
            aria-label="About"
          >
            <Info className="h-4 w-4" />
          </Button>
          <ModeToggle />
          <a
            href="https://github.com/svenvg93/ookla-server-list"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center p-2"
            aria-label="GitHub repository"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844a9.59 9.59 0 012.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-screen-2xl px-8 py-8">
        {/* Search */}
        <TooltipProvider>
          <div className="flex gap-2 mb-6 max-w-2xl">
            <div className="relative flex-1">
              <Input
                ref={searchRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchServers(query)}
                placeholder="Search by ISP, operator, city… (e.g. Orange, Paris, Vodafone)"
                className={query ? 'pr-8' : undefined}
              />
              {query && (
                <button
                  onClick={() => { setQuery(''); setGlobalFilter(''); fetchServers('') }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button onClick={() => fetchServers(query)} disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              {loading ? 'Loading…' : 'Search'}
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 text-muted-foreground" tabIndex={-1}>
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-64 text-xs leading-relaxed">
                <p className="font-medium mb-1">How search works</p>
                <p>The first word is sent to the Speedtest API to fetch matching servers. Any additional words refine the results locally — so <span className="font-mono">Orange France</span> fetches all Orange servers, then filters for France.</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive mb-4">
            Error: {error}
          </div>
        )}

        {/* Toolbar */}
        {hasData && (
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <div className="flex items-center gap-2 flex-1 flex-wrap">
              {(() => {
                const { pageIndex, pageSize } = table.getState().pagination
                const total = table.getFilteredRowModel().rows.length
                const from = total === 0 ? 0 : pageIndex * pageSize + 1
                const to = Math.min((pageIndex + 1) * pageSize, total)
                return <span className="text-sm text-muted-foreground">Showing <strong className="text-foreground">{from}–{to}</strong> of{' '}<strong className="text-foreground">{total}</strong></span>
              })()}
              <span className="text-muted-foreground/40 select-none text-sm">·</span>
              <Badge variant="secondary" className="font-normal gap-1">
                <span className="font-semibold">{stats.countries}</span> countries
              </Badge>
              <Badge variant="secondary" className="font-normal gap-1">
                <span className="font-semibold">{stats.isps}</span> ISPs
              </Badge>
            </div>
            <div className="relative">
              <Input
                ref={filterRef}
                value={globalFilter}
                onChange={e => table.setGlobalFilter(e.target.value)}
                placeholder="Filter by ISP, city, country…"
                className={`h-9 w-56 ${globalFilter ? 'pr-7' : ''}`}
              />
              {globalFilter && (
                <button
                  onClick={clearFilter}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear filter"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={() => fetchServers(query)}
              disabled={loading}
              aria-label="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Columns <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table.getAllColumns().filter(c => c.getCanHide()).map(col => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    className="capitalize"
                    checked={col.getIsVisible()}
                    onCheckedChange={v => col.toggleVisibility(!!v)}
                  >
                    {COLUMN_LABELS[col.id] ?? col.id}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Table */}
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(hg => (
                <TableRow key={hg.id}>
                  {hg.headers.map(header => (
                    <TableHead key={header.id} className={header.id === 'sponsor' ? 'pl-8' : undefined}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i}>
                    {columns.map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length}>
                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                      <ServerOff className="h-10 w-10 opacity-30" />
                      <p className="text-sm font-medium">No servers match your filter</p>
                      {globalFilter && (
                        <Button variant="outline" size="sm" onClick={clearFilter} className="gap-1.5">
                          <X className="h-3.5 w-3.5" />
                          Clear filter
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map(row => (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedServer(row.original)}
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id} className={cell.column.id === 'sponsor' ? 'pl-8' : undefined}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {hasData && (
          <div className="flex items-center justify-between py-4">
            <span className="text-sm text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <div className="flex items-center gap-2">
              <Select
                value={String(table.getState().pagination.pageSize)}
                onValueChange={v => table.setPageSize(Number(v))}
              >
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 15, 20, 25].map(n => (
                    <SelectItem key={n} value={String(n)}>{n} / page</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                Previous
              </Button>
              <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                Next
              </Button>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t px-8 py-4 mt-8">
        <p className="text-xs text-muted-foreground text-center">
          This tool is not affiliated with, endorsed by, or connected to Ookla, LLC or Speedtest.net.
          Server data is sourced from the publicly available Speedtest server list.
          All trademarks belong to their respective owners.
        </p>
      </footer>
    </div>
  )
}

import { type Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { type Server } from '@/lib/types'

interface ServersPaginationProps {
  table: Table<Server>
}

export function ServersPagination({ table }: ServersPaginationProps) {
  return (
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
  )
}

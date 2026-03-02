import * as React from 'react'
import { type Column } from '@tanstack/react-table'
import { Check, PlusCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command, CommandEmpty, CommandGroup, CommandInput,
  CommandItem, CommandList, CommandSeparator,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'

interface DataTableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>
  title: string
  renderOption?: (value: string) => React.ReactNode
}

export function DataTableFacetedFilter<TData, TValue>({
  column, title, renderOption,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const facets = column?.getFacetedUniqueValues()
  const options = React.useMemo(
    () => [...(facets?.keys() ?? [])].sort() as string[],
    [facets],
  )
  const selectedValues = new Set(column?.getFilterValue() as string[])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 border-dashed">
          <PlusCircle className="h-4 w-4" />
          {title}
          {selectedValues.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-1 h-4" />
              <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                {selectedValues.size}
              </Badge>
              <div className="hidden gap-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                    {selectedValues.size} selected
                  </Badge>
                ) : (
                  [...selectedValues].map(v => (
                    <Badge key={v} variant="secondary" className="rounded-sm px-1 font-normal">
                      {v}
                    </Badge>
                  ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map(value => {
                const isSelected = selectedValues.has(value)
                return (
                  <CommandItem
                    key={value}
                    onSelect={() => {
                      if (isSelected) selectedValues.delete(value)
                      else selectedValues.add(value)
                      const arr = [...selectedValues]
                      column?.setFilterValue(arr.length ? arr : undefined)
                    }}
                  >
                    <div className={cn(
                      'flex size-4 items-center justify-center rounded-[4px] border',
                      isSelected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-input [&_svg]:invisible',
                    )}>
                      <Check className="size-3.5 text-primary-foreground" />
                    </div>
                    <span className="truncate">{renderOption ? renderOption(value) : value}</span>
                    {facets?.get(value) && (
                      <span className="ml-auto font-mono text-xs text-muted-foreground">
                        {facets.get(value)}
                      </span>
                    )}
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => column?.setFilterValue(undefined)}
                    className="justify-center text-center"
                  >
                    Clear filter
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

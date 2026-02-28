import { useState } from 'react'
import { Copy, Check, ExternalLink, MapPin, Star } from 'lucide-react'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { type Server } from '@/lib/types'
import { countryFlag } from '@/lib/utils'

interface ServerDetailSheetProps {
  server: Server | null
  onClose: () => void
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="flex items-center gap-2">
        <p className="font-mono text-sm break-all flex-1">{value}</p>
        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={copy}>
          {copied
            ? <Check className="h-3 w-3 text-emerald-500" />
            : <Copy className="h-3 w-3 text-muted-foreground" />}
        </Button>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="text-sm">{children}</div>
    </div>
  )
}

export function ServerDetailSheet({ server, onClose }: ServerDetailSheetProps) {
  return (
    <Sheet open={!!server} onOpenChange={open => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md flex flex-col overflow-hidden">
        {server && (
          <>
            <SheetHeader className="mb-4 shrink-0">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <SheetTitle className="leading-snug">{server.sponsor}</SheetTitle>
                  <SheetDescription className="mt-0.5">
                    {server.name}, {server.country}
                  </SheetDescription>
                </div>
                {server.preferred ? (
                  <Badge variant="secondary" className="shrink-0 gap-1 mt-0.5">
                    <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                    Preferred
                  </Badge>
                ) : null}
              </div>
              <a
                href={`https://www.speedtest.net/server/${server.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex"
              >
                <Button className="w-full gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Run speed test
                </Button>
              </a>
            </SheetHeader>

            <Tabs defaultValue="details" className="flex flex-col flex-1 min-h-0">
              <TabsList className="w-full shrink-0">
                <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
                <TabsTrigger value="map" className="flex-1">Map</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="flex-1 overflow-y-auto mt-4 space-y-5">
                {/* Identifiers */}
                <section className="space-y-3">
                  <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Identifiers</h3>
                  <CopyField label="Server ID" value={server.id} />
                  <CopyField label="Host" value={server.host} />
                  <CopyField label="Test URL" value={server.url} />
                </section>

                <div className="border-t" />

                {/* Location */}
                <section className="space-y-3">
                  <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Location</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Country">
                      <span className="flex items-center gap-1.5">
                        <span className="text-base leading-none">{countryFlag(server.cc)}</span>
                        {server.country} ({server.cc})
                      </span>
                    </Field>
                    <Field label="City">{server.name}</Field>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Latitude">{server.lat}</Field>
                    <Field label="Longitude">{server.lon}</Field>
                  </div>
                </section>
              </TabsContent>

              <TabsContent value="map" className="flex-1 min-h-0 mt-4">
                <div className="rounded-lg overflow-hidden border h-full min-h-64">
                  <iframe
                    title="Server location"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(server.lon) - 1},${Number(server.lat) - 1},${Number(server.lon) + 1},${Number(server.lat) + 1}&layer=mapnik&marker=${server.lat},${server.lon}`}
                    className="w-full h-full"
                    loading="lazy"
                  />
                </div>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${server.lat}&mlon=${server.lon}&zoom=10`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mt-2"
                >
                  <MapPin className="h-3 w-3" />
                  Open in OpenStreetMap
                  <ExternalLink className="h-3 w-3" />
                </a>
              </TabsContent>
            </Tabs>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

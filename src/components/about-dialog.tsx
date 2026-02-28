import { Zap, Github, Database, Info, ExternalLink } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'

interface AboutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AboutDialog({ open, onOpenChange }: AboutDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle className="leading-none">Speedtest Server Explorer</DialogTitle>
              <DialogDescription className="mt-0.5 text-xs">
                Browse &amp; discover Speedtest servers worldwide
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 text-sm">
          {/* About */}
          <section className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <Info className="h-3 w-3" />
              About
            </div>
            <p className="text-muted-foreground leading-relaxed">
              A fast, searchable interface for exploring the public Speedtest server network.
              Find servers by ISP, city, or country, view their details, and launch a speed test in one click.
            </p>
          </section>

          <div className="border-t" />

          {/* Data source */}
          <section className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <Database className="h-3 w-3" />
              Data source
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Server data is fetched from the publicly available Speedtest server list
              at <span className="font-mono text-xs text-foreground">www.speedtest.net/api/js/servers</span>.
              Data is refreshed on each search.
            </p>
          </section>

          <div className="border-t" />

          {/* Links */}
          <section className="space-y-2.5">
            <a
              href="https://github.com/svenvg93/ookla-server-list"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-4 w-4 shrink-0" />
              View source on GitHub
            </a>
            <a
              href="https://github.com/alexjustesen/speedtest-tracker"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-4 w-4 shrink-0" />
              <span>
                Speedtest Tracker
                <span className="ml-1.5 text-xs text-muted-foreground/60">— self-hosted scheduled speed tests</span>
              </span>
            </a>
          </section>

          <div className="border-t" />

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground leading-relaxed">
            Not affiliated with, endorsed by, or connected to Ookla, LLC or Speedtest.net.
            All trademarks belong to their respective owners.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

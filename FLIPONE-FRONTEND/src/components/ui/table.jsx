import { cn } from "@/lib/utils"

/*
 * Mock-up portal tables: 14px body, Barlow Condensed caps headers on #FAF9F6, 1px line-soft rules,
 * 44px rows, warm row hover. For sticky headers and a scroll container use <DataTable>
 * (src/components/flipone/DataTable.jsx), which wraps these.
 */
function Table({
  className,
  containerClassName,
  containerStyle,
  ...props
}) {
  return (
    <div
      data-slot="table-container"
      className={cn("relative w-full overflow-x-auto", containerClassName)}
      style={containerStyle}
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom border-collapse text-sm text-ink", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({
  className,
  ...props
}) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b [&_tr]:border-line-soft [&_tr]:hover:bg-transparent", className)}
      {...props}
    />
  )
}

function TableBody({
  className,
  ...props
}) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({
  className,
  ...props
}) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t border-line-soft bg-head font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({
  className,
  ...props
}) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b border-line-soft transition-colors duration-100 hover:bg-row-hover has-aria-expanded:bg-row-hover data-[state=selected]:bg-paper-2",
        className
      )}
      {...props}
    />
  )
}

function TableHead({
  className,
  ...props
}) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-10 bg-head px-3 text-left align-middle font-display text-[12.5px] leading-none font-semibold tracking-[0.1em] whitespace-nowrap text-muted-foreground uppercase [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

function TableCell({
  className,
  ...props
}) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "h-11 px-3 py-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-[13px] text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}

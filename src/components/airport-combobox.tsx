"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { BUSIEST_AIRPORTS } from "@/lib/constants";

export interface AirportOption {
  id: number;
  name: string;
  city: string;
  state: string;
}

interface AirportComboboxProps {
  airports: AirportOption[];
  value: number | null;
  onChange: (airportId: number | null) => void;
}

export function AirportCombobox({
  airports,
  value,
  onChange,
}: AirportComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const selected = airports.find((a) => a.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selected
            ? `${selected.name} (${selected.city}, ${selected.state})`
            : "Select arrival airport…"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[420px] p-0">
        <Command>
          <CommandInput placeholder="Search airports…" />
          <CommandList>
            <CommandEmpty>No airports found.</CommandEmpty>
            <CommandGroup>
              {airports.map((airport) => (
                <CommandItem
                  key={airport.id}
                  value={`${airport.name} ${airport.city} ${airport.state}`}
                  onSelect={() => {
                    onChange(airport.id === value ? null : airport.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === airport.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {airport.name}{" "}
                  <span className="ml-1 text-muted-foreground text-sm">
                    ({airport.city}, {airport.state})
                  </span>
                  {BUSIEST_AIRPORTS[airport.id] && (
                    <Badge
                      variant={BUSIEST_AIRPORTS[airport.id].hub === "large" ? "default" : "secondary"}
                      className="ml-1.5 text-[10px] px-1.5 py-0"
                    >
                      {BUSIEST_AIRPORTS[airport.id].hub === "large"
                        ? `Top ${BUSIEST_AIRPORTS[airport.id].rank}`
                        : "Busy"}
                    </Badge>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

import * as React from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface CollapseProps {
  trigger: React.ReactNode
  children: React.ReactNode
  className?: string
  triggerClassName?: string
  contentClassName?: string
}

export function Collapse({
                           trigger,
                           children,
                           className,
                           triggerClassName,
                           contentClassName
                         }: CollapseProps) {
  return (
    <Accordion type="single" collapsible className={`w-full ${className || ''}`}>
      <AccordionItem
        value="item-1"
        className="border-2 border-[#EFCB4C] rounded-lg border-b-2"
      >
        <AccordionTrigger
          className={`px-6 py-4 hover:bg-[#F5E094] transition-colors [&[data-state=open]]:bg-[#F5E094] ${triggerClassName || ''}`}
        >
          {trigger}
        </AccordionTrigger>
        <AccordionContent className={`px-6 py-4 ${contentClassName || ''}`}>
          {children}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

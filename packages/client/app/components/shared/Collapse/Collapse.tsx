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
        className="border-0"
      >
        <AccordionTrigger
          className={`py-[32px] px-[24px] border-2 border-[#EFCB4C] rounded-lg hover:bg-[#F5E094] transition-colors data-[state=open]:bg-[#F5E094] data-[state=open]:rounded-b-none ${triggerClassName || ''}`}
        >
          {trigger}
        </AccordionTrigger>
        <AccordionContent
          className={`py-[32px] px-[24px] border-2 border-t-0 border-[#EFCB4C] rounded-b-lg bg-white shadow-[0_-10px_18px_rgba(0,0,0,0.08)] ${contentClassName || ''}`}
        >
          {children}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

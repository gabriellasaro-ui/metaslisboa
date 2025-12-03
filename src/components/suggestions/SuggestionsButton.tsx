import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";
import { SuggestionsDialog } from "./SuggestionsDialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export const SuggestionsButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setOpen(true)}
            className="relative"
          >
            <Lightbulb className="h-5 w-5 text-yellow-500" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Sugestões e Melhorias</p>
        </TooltipContent>
      </Tooltip>

      <SuggestionsDialog open={open} onOpenChange={setOpen} />
    </>
  );
};
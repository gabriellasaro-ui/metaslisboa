import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  HelpCircle,
  Database, 
  CheckCircle2, 
  Calendar, 
  TrendingUp, 
  BarChart3, 
  Users, 
  Target,
  Zap,
  Info
} from "lucide-react";
import { TourGuide } from "./TourGuide";

export const TourButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="lg"
        onClick={() => setOpen(true)}
        className="gap-2 border-primary/30 hover:border-primary/50 hover:bg-primary/5"
      >
        <HelpCircle className="h-5 w-5" />
        Tour
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[900px] max-h-[90vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-0">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Info className="h-6 w-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-2xl">Tour Completo do Sistema</DialogTitle>
                <p className="text-muted-foreground text-base mt-1">
                  Tudo que você precisa saber sobre o dashboard
                </p>
              </div>
            </div>
          </DialogHeader>
          
          <ScrollArea className="max-h-[calc(90vh-120px)]">
            <div className="px-6 pb-6">
              <TourGuide />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

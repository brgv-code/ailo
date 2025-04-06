"use client";

import * as React from "react";
import {
  PanelGroup,
  Panel,
  PanelResizeHandle,
  ImperativePanelHandle,
} from "react-resizable-panels";
import { cn } from "@/lib/utils";

type ImperativePanelGroupHandle = {
  getId: () => string;
  getLayout: () => number[];
  setLayout: (layout: number[]) => void;
};

const ResizablePanelGroup = React.forwardRef<
  ImperativePanelGroupHandle,
  React.ComponentProps<typeof PanelGroup>
>(({ className, ...props }, ref) => (
  <PanelGroup
    ref={ref}
    className={cn(
      "flex size-full data-[panel-group-direction=vertical]:flex-col",
      className
    )}
    {...props}
  />
));
ResizablePanelGroup.displayName = "ResizablePanelGroup";

const ResizablePanel = React.forwardRef<
  ImperativePanelHandle,
  React.ComponentProps<typeof Panel>
>(({ className, ...props }, ref) => (
  <Panel
    ref={ref}
    className={cn("flex min-w-0 flex-1", className)}
    {...props}
  />
));
ResizablePanel.displayName = "ResizablePanel";

interface ResizableHandleProps
  extends React.ComponentProps<typeof PanelResizeHandle> {
  direction?: "horizontal" | "vertical";
}

const ResizableHandle = ({
  className,
  direction,
  ...props
}: ResizableHandleProps) => (
  <PanelResizeHandle
    className={cn(
      "group flex size-2 items-center justify-center bg-zinc-800 transition-colors hover:bg-zinc-700",
      direction === "vertical" ? "cursor-ns-resize" : "cursor-ew-resize",
      className
    )}
    {...props}
  >
    <div
      className={cn(
        "size-0.5 rounded-full bg-zinc-600 transition-all group-hover:bg-zinc-400",
        direction === "vertical" ? "h-1 w-8" : "h-8 w-1"
      )}
    />
  </PanelResizeHandle>
);
ResizableHandle.displayName = "ResizableHandle";

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      position="top-center"
      offset="calc(env(safe-area-inset-top, 0px) + 24px)"
      mobileOffset="calc(env(safe-area-inset-top, 0px) + 32px)"
      gap={14}
      visibleToasts={3}
      style={
        {
          "--width": "min(420px, calc(100vw - 24px))",
          "--mobile-width": "calc(100vw - 24px)",
          "--border-radius": "16px",
        } as React.CSSProperties
      }
      toastOptions={{
        duration: 6000,
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border group-[.toaster]:border-border group-[.toaster]:shadow-2xl group-[.toaster]:rounded-2xl group-[.toaster]:p-5 group-[.toaster]:gap-3 group-[.toaster]:items-start",
          title:
            "group-[.toast]:text-base sm:group-[.toast]:text-lg group-[.toast]:font-semibold group-[.toast]:leading-snug group-[.toast]:tracking-tight",
          description:
            "group-[.toast]:text-muted-foreground group-[.toast]:text-sm sm:group-[.toast]:text-base group-[.toast]:leading-relaxed group-[.toast]:mt-1",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-xl group-[.toast]:px-4 group-[.toast]:py-2.5 group-[.toast]:text-sm sm:group-[.toast]:text-base group-[.toast]:font-semibold group-[.toast]:min-h-11 group-[.toast]:min-w-11 group-[.toast]:shadow-sm group-[.toast]:transition-transform hover:group-[.toast]:scale-[1.02] active:group-[.toast]:scale-[0.98]",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-xl group-[.toast]:px-4 group-[.toast]:py-2.5 group-[.toast]:text-sm sm:group-[.toast]:text-base group-[.toast]:font-medium group-[.toast]:min-h-11 group-[.toast]:min-w-11",
          closeButton:
            "group-[.toast]:bg-background group-[.toast]:border-border group-[.toast]:text-foreground group-[.toast]:min-h-9 group-[.toast]:min-w-9",
          icon: "group-[.toast]:size-5 group-[.toast]:mt-0.5",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

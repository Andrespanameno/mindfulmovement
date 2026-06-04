import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      position="top-center"
      offset="calc(env(safe-area-inset-top, 0px) + 40px)"
      mobileOffset="calc(env(safe-area-inset-top, 0px) + 56px)"
      gap={16}
      visibleToasts={3}
      closeButton
      dismissible
      style={
        {
          "--width": "min(480px, calc(100vw - 24px))",
          "--mobile-width": "calc(100vw - 20px)",
          "--border-radius": "18px",
        } as React.CSSProperties
      }
      toastOptions={{
        duration: 7000,
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border group-[.toaster]:border-border group-[.toaster]:shadow-2xl group-[.toaster]:rounded-2xl group-[.toaster]:p-6 group-[.toaster]:gap-4 group-[.toaster]:items-start",
          title:
            "group-[.toast]:text-lg sm:group-[.toast]:text-xl group-[.toast]:font-semibold group-[.toast]:leading-snug group-[.toast]:tracking-tight",
          description:
            "group-[.toast]:text-foreground/80 group-[.toast]:text-base sm:group-[.toast]:text-lg group-[.toast]:leading-relaxed group-[.toast]:mt-1.5",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-xl group-[.toast]:px-5 group-[.toast]:py-3 group-[.toast]:text-base sm:group-[.toast]:text-lg group-[.toast]:font-semibold group-[.toast]:min-h-12 group-[.toast]:min-w-12 group-[.toast]:shadow-sm group-[.toast]:transition-transform hover:group-[.toast]:scale-[1.02] active:group-[.toast]:scale-[0.98]",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-xl group-[.toast]:px-5 group-[.toast]:py-3 group-[.toast]:text-base sm:group-[.toast]:text-lg group-[.toast]:font-medium group-[.toast]:min-h-12 group-[.toast]:min-w-12",
          closeButton:
            "group-[.toast]:bg-background group-[.toast]:border-border group-[.toast]:text-foreground group-[.toast]:min-h-10 group-[.toast]:min-w-10",
          icon: "group-[.toast]:size-6 group-[.toast]:mt-0.5",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

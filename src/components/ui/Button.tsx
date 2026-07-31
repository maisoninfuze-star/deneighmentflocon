import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Premium button. Lifts on hover, gold glow on the primary variant,
 * light sweeps across the surface. Never bounces.
 */
const button = cva(
  [
    "group/btn relative inline-flex items-center justify-center gap-2.5",
    "font-medium whitespace-nowrap select-none isolate overflow-hidden",
    "transition-[transform,box-shadow,background-color,border-color,color]",
    "duration-500 ease-(--ease-out-expo) will-change-transform",
    "hover:-translate-y-0.5 active:translate-y-0 active:duration-100",
    "disabled:pointer-events-none disabled:opacity-45",
    "motion-reduce:hover:translate-y-0",
  ],
  {
    variants: {
      variant: {
        /* The blade. Reserved for the single most important action on screen. */
        primary: [
          "bg-gold-500 text-navy-950 font-semibold",
          "shadow-[0_8px_24px_-10px_rgba(246,189,11,0.6)]",
          "hover:bg-gold-400 hover:shadow-(--shadow-gold)",
        ],
        /* Quiet, cold, glassy. The default for everything else. */
        glass: [
          "text-snow border border-ice-300/20",
          "bg-white/6 backdrop-blur-xl",
          "hover:bg-white/12 hover:border-ice-300/35",
          "shadow-[0_8px_30px_-12px_rgba(1,18,31,0.6)]",
        ],
        /* Solid navy — for light/snow sections. */
        navy: [
          "bg-navy-800 text-snow font-semibold",
          "hover:bg-navy-700",
          "shadow-[0_10px_30px_-12px_rgba(5,48,80,0.65)]",
        ],
        outline: [
          "border border-navy-800/25 text-navy-900",
          "hover:border-navy-800/50 hover:bg-navy-800/4",
        ],
        ghost: ["text-snow/75 hover:text-snow hover:bg-white/8"],
      },
      size: {
        sm: "h-10 rounded-full px-5 text-sm",
        md: "h-12 rounded-full px-7 text-[0.9375rem]",
        lg: "h-14 rounded-full px-9 text-base",
        xl: "h-16 rounded-full px-11 text-lg",
        icon: "size-11 rounded-full",
      },
    },
    defaultVariants: { variant: "glass", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {
  asChild?: boolean;
}

/** Light sweep that crosses the button on hover. Purely decorative. */
function Sheen() {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -z-10",
        "bg-linear-100 from-transparent via-white/25 to-transparent",
        "translate-x-[-120%] transition-transform duration-900 ease-(--ease-out-expo)",
        "group-hover/btn:translate-x-[120%]",
        "motion-reduce:hidden",
      )}
    />
  );
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(button({ variant, size }), className)}
      {...props}
    >
      <Sheen />
      {children}
    </button>
  ),
);
Button.displayName = "Button";

/** Same surface treatment, rendered as an anchor. */
export const ButtonLink = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & VariantProps<typeof button>
>(({ className, variant, size, children, ...props }, ref) => (
  <a
    ref={ref}
    className={cn(button({ variant, size }), className)}
    {...props}
  >
    <Sheen />
    {children}
  </a>
));
ButtonLink.displayName = "ButtonLink";

export { button as buttonVariants };

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const variants = {
      default: "bg-primary text-primary-foreground shadow-[0_8px_18px_rgba(249,115,22,0.25)] hover:bg-[#f26409]",
      destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
      outline: "border border-[#eadfce] bg-[#fffaf4] text-[#6e5f52] shadow-sm hover:bg-accent hover:text-accent-foreground",
      secondary: "bg-[#f2ebdf] text-[#6e5f52] shadow-sm hover:bg-[#ece3d5]",
      ghost: "hover:bg-[#f4eee3] hover:text-[#55463a]",
      link: "text-primary underline-offset-4 hover:underline",
    }
    const sizes = {
      default: "h-11 px-5 py-2.5",
      sm: "h-8 rounded-full px-3 text-xs",
      lg: "h-12 rounded-full px-8",
      icon: "h-11 w-11 rounded-full",
    }

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f09a52]/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }

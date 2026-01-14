import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90 dark:shadow-lg dark:shadow-primary/20",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 dark:shadow-md dark:shadow-destructive/20",
        outline:
          "border-2 border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground dark:border-primary/60 dark:hover:bg-primary/10 dark:hover:border-primary",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 dark:bg-secondary/80 dark:hover:bg-secondary dark:shadow-md",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/80",
        link: "text-primary underline-offset-4 hover:underline dark:text-primary-foreground",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // Estilos inline para melhor visibilidade no dark mode
    const getInlineStyle = (): React.CSSProperties => {
      if (props.disabled) return {}
      
      switch (variant) {
        case 'default':
          return {
            backgroundColor: '#7c3aed',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
            fontWeight: '600',
          }
        case 'outline':
          return {
            borderColor: '#7c3aed',
            borderWidth: '2px',
            color: '#7c3aed',
            fontWeight: '600',
          }
        case 'secondary':
          return {
            backgroundColor: '#374151',
            color: '#ffffff',
            fontWeight: '600',
          }
        default:
          return {}
      }
    }
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        style={getInlineStyle()}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

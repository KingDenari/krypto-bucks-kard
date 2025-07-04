
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:transform hover:-translate-y-0.5 hover:shadow-lg border-2 border-black bg-white text-black",
  {
    variants: {
      variant: {
        default: "bg-white text-black border-black hover:bg-gray-100 shadow-sm",
        destructive:
          "bg-red-600 text-white border-red-600 hover:bg-red-700 shadow-sm",
        outline:
          "border-black bg-white hover:bg-gray-100 text-black",
        secondary:
          "bg-gray-100 text-black border-black hover:bg-gray-200",
        ghost: "border-black hover:bg-gray-100 text-black bg-white",
        link: "text-black underline-offset-4 hover:underline border-black bg-white",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-lg px-8",
        icon: "h-10 w-10",
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
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        style={{
          backgroundColor: variant === 'destructive' ? '#DC2626' : '#FFFFFF',
          color: variant === 'destructive' ? '#FFFFFF' : '#000000',
          borderColor: variant === 'destructive' ? '#DC2626' : '#000000',
          borderWidth: '2px',
          borderStyle: 'solid'
        }}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

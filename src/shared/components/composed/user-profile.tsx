import * as React from "react"
import { ChevronDown } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import { cn } from "@/shared/utils/cn"

export interface UserProfileProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  role: string;
  initials?: string;
  imageUrl?: string;
  /** Muestra un `ChevronDown` que indica que es un desplegable; rota si el contenedor tiene `group` y `data-popup-open`. */
  chevron?: boolean;
  /** Menos de 640 px: solo avatar (y chevron). */
  compacto?: boolean;
  /** Cabecera del menú desplegable: textos pequeños siempre visibles. */
  enMenu?: boolean;
}

export function UserProfile({
  name,
  role,
  initials,
  imageUrl,
  chevron = false,
  compacto = false,
  enMenu = false,
  className,
  ...props
}: UserProfileProps) {
  const getInitials = (fullName: string) => {
    if (!fullName) return "??";
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const displayInitials = initials || getInitials(name);

  return (
    <div className={cn("flex items-center", compacto ? "gap-2" : "gap-3", className)} {...props}>
      <Avatar className={compacto ? "size-9" : enMenu ? "size-10" : undefined}>
        <AvatarImage src={imageUrl} alt="" />
        <AvatarFallback>{displayInitials}</AvatarFallback>
      </Avatar>

      <div className={cn("min-w-0 flex-col text-left", compacto ? "hidden sm:flex" : "flex")}>
        <span className={cn("truncate font-extrabold leading-tight text-foreground", compacto || enMenu ? "text-[13.5px]" : "text-[17px] font-semibold")}>
          {name}
        </span>
        <span className={cn("truncate font-normal text-muted-foreground", compacto || enMenu ? "text-[12px]" : "text-[13px]")}>
          {role}
        </span>
      </div>

      {chevron && (
        <ChevronDown
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-popup-open:rotate-180"
        />
      )}
    </div>
  )
}

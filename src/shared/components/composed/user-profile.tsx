import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import { cn } from "@/shared/utils/cn"

export interface UserProfileProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  role: string;
  initials?: string;
  imageUrl?: string;
}

export function UserProfile({
  name,
  role,
  initials,
  imageUrl,
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
    <div className={cn("flex items-center gap-4", className)} {...props}>
      <Avatar>
        <AvatarImage src={imageUrl} alt={name} />
        <AvatarFallback>{displayInitials}</AvatarFallback>
      </Avatar>

      <div className="flex flex-col">
        <span className="font-display text-[17px] font-semibold leading-tight text-slate-900 dark:text-stone-100">
          {name}
        </span>
        <span className="text-[13px] font-normal text-slate-600 dark:text-stone-400">
          {role}
        </span>
      </div>
    </div>
  )
}
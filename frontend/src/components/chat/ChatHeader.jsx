"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MoreVertical } from "lucide-react"

export function ChatHeader({ receiverName, receiverAvatar, isOnline, onBack }) {
  return (
    <div className="flex items-center gap-3 p-4 border-b bg-white">
      {onBack && (
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
      )}

      <Avatar className="w-10 h-10">
        <AvatarImage
          src={
            receiverAvatar ||
            "/placeholder.svg?height=40&width=40&query=user avatar"
          }
        />
        <AvatarFallback>
          {receiverName ? receiverName.charAt(0) : "U"}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <h2 className="font-semibold text-gray-900">{receiverName}</h2>
        <p className="text-sm text-gray-500">
          {isOnline ? "Online" : "Last seen recently"}
        </p>
      </div>

      <Button variant="ghost" size="icon">
        <MoreVertical className="h-5 w-5" />
      </Button>
    </div>
  )
}

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

export function MessageBubble({ message, isOwn }) {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div
      className={cn(
        "flex gap-2 mb-4",
        isOwn ? "flex-row-reverse" : "flex-row"
      )}
    >
      {!isOwn && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src="/placeholder.svg?height=32&width=32" />
          <AvatarFallback>
            {message.senderName
              ? message.senderName.charAt(0)
              : "U"}
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "flex flex-col",
          isOwn ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "max-w-xs lg:max-w-md px-4 py-2 rounded-2xl break-words",
            isOwn
              ? "bg-green-500 text-white rounded-br-md"
              : "bg-gray-100 text-gray-900 rounded-bl-md"
          )}
        >
          <p className="text-sm">{message.content}</p>
        </div>

        <span className="text-xs text-gray-500 mt-1 px-2">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  )
}

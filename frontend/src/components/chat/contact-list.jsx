"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, MessageCircle } from "lucide-react"
import { getContacts } from "@/services/chatService"
import { fetchCustomerInfo } from "@/services/customerService"
import { socketManager } from "@/lib/socket"

export function ContactList({ onSelectContact, selectedContactId }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [contacts, setContacts] = useState([])
  const [currentUser, setCurrentUser] = useState(null)

  // Init user, contacts, socket subscriptions
  useEffect(() => {
    const init = async () => {
      try {
        const user = await fetchCustomerInfo()
        setCurrentUser(user)

        const res = await getContacts(user.userId)
        setContacts(res || [])

        if (!socketManager.isConnected()) {
          await socketManager.connect(user.userId, user.lastName || String(user.userId))
        }

        // Subscribe all sessions for realtime updates
        res?.forEach((contact) => {
          if (contact.id) { // id = sessionId
            socketManager.subscribeToSession(contact.id, (message) => {
              setContacts((prev) =>
                prev.map((c) => {
                  if (c.id === contact.id) {
                    const isActive = selectedContactId === c.id
                    return {
                      ...c,
                      lastMessage: message.content,
                      lastMessageTime: message.timestamp || new Date(),
                      unreadCount: isActive ? 0 : (c.unreadCount || 0) + 1,
                    }
                  }
                  return c
                })
              )
            })
          }
        })
      } catch (error) {
        console.error("Failed to initialize contacts:", error)
      }
    }

    init()
  }, [selectedContactId])

  const filteredContacts = contacts.filter((contact) => {
    const name = contact.name?.toLowerCase() || ""
    const id = String(contact.id || "").toLowerCase()

    return (
      name.includes(searchQuery.toLowerCase()) ||
      id.includes(searchQuery.toLowerCase())
    )
  })

  const handleSelectContact = (contact) => {
    // Reset unread count
    setContacts((prev) =>
      prev.map((c) =>
        c.id === contact.id ? { ...c, unreadCount: 0 } : c
      )
    )
    onSelectContact(contact)
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Chats
        </CardTitle>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-0">
        <div className="space-y-1">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => handleSelectContact(contact)}
              className={`flex items-center gap-3 p-3 cursor-pointer transition-colors hover:bg-gray-50 ${
                selectedContactId === contact.id
                  ? "bg-green-50 border-r-2 border-green-500"
                  : ""
              }`}
            >
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={contact.profilePic || "/placeholder.svg"}
                    alt={contact.name}
                  />
                  <AvatarFallback>
                    {contact.name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>

                {contact.isOnline && (
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-white rounded-full" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm truncate">
                    {contact.name}
                  </h3>

                  {contact.lastMessageTime && (
                    <span className="text-xs text-gray-500">
                      {new Date(contact.lastMessageTime).toLocaleTimeString(
                        "vi-VN",
                        { hour: "2-digit", minute: "2-digit" }
                      )}
                    </span>
                  )}
                </div>

                {contact.lastMessage && (
                  <p className="text-sm text-gray-600 truncate">
                    {contact.lastMessage}
                  </p>
                )}
              </div>

              {Number(contact.unreadCount) > 0 && (
                <Badge
                  variant="destructive"
                  className="h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {contact.unreadCount}
                </Badge>
              )}
            </div>
          ))}

          {filteredContacts.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No conversations found</p>
              <p className="text-sm">
                Start a new chat by adding a contact above
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

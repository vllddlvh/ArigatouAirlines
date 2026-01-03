"use client"
import { useState } from "react"
import { ContactList } from "./contact-list"
import { ChatWindow } from "./chat-window"
import { Card } from "@/components/ui/card"
import { MessageCircle, ArrowLeft, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function ChatLayout() {
  const [selectedContact, setSelectedContact] = useState(null)
  const [showMobileChat, setShowMobileChat] = useState(false)
  const router = useRouter()

  const handleSelectContact = (contact) => {
    setSelectedContact(contact)
    setShowMobileChat(true)
  }

  const handleBackToContacts = () => {
    setShowMobileChat(false)
    setSelectedContact(null)
  }

  return (
    <div className="w-[1200px] ml-[320px] h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <div className="w-full bg-white shadow-sm border-b p-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Messenger</h2>
        <Button
          variant="ghost"
          className="gap-2"
          onClick={() => router.push("/")}
        >
          <Home className="h-4 w-4" />
          Home
        </Button>
      </div>

      {/* Nội dung chat */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-4">
        <div className="grid grid-cols-12 gap-4 h-full">
          {/* Danh bạ */}
          <div
            className={`col-span-12 md:col-span-4 lg:col-span-3 ${
              showMobileChat ? "hidden md:block" : "block"
            }`}
          >
            <ContactList
              onSelectContact={handleSelectContact}
              selectedContactId={selectedContact?.id}
            />
          </div>

          {/* Cửa sổ chat */}
          <div
            className={`col-span-12 md:col-span-8 lg:col-span-9 ${
              !showMobileChat ? "hidden md:block" : "block"
            }`}
          >
            {selectedContact ? (
              <div className="h-full">
                <div className="md:hidden mb-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToContacts}
                    className="gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </div>
                <ChatWindow
                  sessionId={selectedContact.id}
                  receiverName={selectedContact.name}
                  receiverAvatar={selectedContact.profilePic}
                />
              </div>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">Welcome to Messenger</h3>
                  <p>Select a conversation to start chatting</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

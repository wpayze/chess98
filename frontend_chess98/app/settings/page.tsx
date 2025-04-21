import { AccountTab } from "@/components/settings/account-tab"
import { GeneralTab } from "@/components/settings/general-tab"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, User } from "lucide-react"

export default function SettingsPage() {
  return (
    <main className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900/90 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-2 text-center bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-center text-muted-foreground mb-8">Customize your Chess98 experience</p>

        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid grid-cols-2 mb-8">
              <TabsTrigger value="general" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">General</span>
              </TabsTrigger>
              <TabsTrigger value="account" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Account</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <GeneralTab />
            </TabsContent>

            <TabsContent value="account">
              <AccountTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  )
}

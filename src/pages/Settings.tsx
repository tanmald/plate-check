import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { BottomNav } from "@/components/BottomNav";
import { LogoutDialog } from "@/components/LogoutDialog";
import { 
  User, 
  Bell, 
  Moon, 
  Shield, 
  HelpCircle, 
  LogOut, 
  ChevronRight,
  FileText,
  Trash2,
  Download,
  Info
} from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  type MenuItem = {
    icon: typeof User;
    label: string;
    action?: boolean;
    toggle?: boolean;
    value?: boolean;
    onChange?: (val: boolean) => void;
    danger?: boolean;
  };

  const accountItems: MenuItem[] = [
    { icon: User, label: "Edit Profile", action: true },
    { icon: Bell, label: "Notifications", toggle: true, value: notifications, onChange: setNotifications },
    { icon: Moon, label: "Dark Mode", toggle: true, value: darkMode, onChange: setDarkMode },
  ];

  const planItems: MenuItem[] = [
    { icon: FileText, label: "View Current Plan", action: true },
    { icon: Download, label: "Export Plan Data", action: true },
    { icon: Trash2, label: "Replace or Discard Plan", action: true, danger: true },
  ];

  const privacyItems: MenuItem[] = [
    { icon: Shield, label: "Privacy Settings", action: true },
    { icon: Trash2, label: "Delete All My Data", action: true, danger: true },
    { icon: HelpCircle, label: "Help & Support", action: true },
  ];

  const renderMenuSection = (items: MenuItem[], title: string) => (
    <Card className="card-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {items.map((item) => (
            <div 
              key={item.label}
              className="flex items-center justify-between px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <item.icon className={`w-5 h-5 ${item.danger ? 'text-destructive' : 'text-muted-foreground'}`} />
                <span className={`font-medium ${item.danger ? 'text-destructive' : ''}`}>{item.label}</span>
              </div>
              {item.toggle ? (
                <Switch 
                  checked={item.value} 
                  onCheckedChange={item.onChange}
                />
              ) : (
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-card border-b border-border safe-top">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6 max-w-lg mx-auto">
        {/* User Info */}
        <Card className="card-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-lg">{user?.email?.split('@')[0] || 'User'}</h2>
                <p className="text-sm text-muted-foreground">{user?.email || 'No email'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        {renderMenuSection(accountItems, "Account")}

        {/* Plan Management */}
        {renderMenuSection(planItems, "Plan Management")}

        {/* Privacy & Data */}
        {renderMenuSection(privacyItems, "Privacy & Data")}

        {/* App Info */}
        <Card className="card-shadow">
          <CardContent className="p-4">
            <div className="text-center text-sm text-muted-foreground">
              <p className="font-medium">PlateCheck v1.0.0</p>
              <p className="mt-1">Made with ❤️ for better nutrition</p>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Card className="border-border bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                PlateCheck is a wellness support tool and is not a medical device. 
                It does not provide medical diagnosis, treatment, or clinical recommendations. 
                Always consult with your healthcare provider.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Button 
          variant="ghost" 
          className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => setLogoutDialogOpen(true)}
        >
          <LogOut className="w-5 h-5 mr-2" />
          Log Out
        </Button>
      </main>

      <LogoutDialog 
        open={logoutDialogOpen} 
        onOpenChange={setLogoutDialogOpen} 
      />

      <BottomNav />
    </div>
  );
}

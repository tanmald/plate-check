import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { BottomNav } from "@/components/BottomNav";
import { MealLogModal } from "@/components/MealLogModal";
import { 
  User, 
  Bell, 
  Moon, 
  Shield, 
  HelpCircle, 
  LogOut, 
  ChevronRight,
  Crown,
  Heart,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Profile() {
  const [isMealLogOpen, setIsMealLogOpen] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const user = {
    name: "Sarah Johnson",
    email: "sarah@example.com",
    plan: "Free",
    analysesLeft: 3,
    analysesTotal: 10,
  };

  const menuItems = [
    { icon: Bell, label: "Notifications", toggle: true, value: notifications, onChange: setNotifications },
    { icon: Moon, label: "Dark Mode", toggle: true, value: darkMode, onChange: setDarkMode },
    { icon: Heart, label: "Apple Health", action: true },
    { icon: Shield, label: "Privacy & Data", action: true },
    { icon: HelpCircle, label: "Help & Support", action: true },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-card border-b border-border safe-top">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground">Profile</h1>
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
                <h2 className="font-semibold text-lg">{user.name}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <Button variant="outline" size="sm">Edit</Button>
            </div>
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card className="card-shadow overflow-hidden">
          <div className="bg-gradient-to-r from-accent/20 to-primary/20 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                  <Zap className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="font-semibold">Free Plan</p>
                  <p className="text-sm text-muted-foreground">
                    {user.analysesLeft} of {user.analysesTotal} analyses left
                  </p>
                </div>
              </div>
              <Button size="sm" className="gap-1">
                <Crown className="w-4 h-4" />
                Upgrade
              </Button>
            </div>
          </div>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-xs">✓</span>
                </div>
                <span className="text-muted-foreground">10 AI analyses per month</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-xs">✓</span>
                </div>
                <span className="text-muted-foreground">Basic adherence feedback</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground/50">
                <div className="w-5 h-5 rounded-full bg-muted/50 flex items-center justify-center">
                  <span className="text-xs">✗</span>
                </div>
                <span>Detailed AI explanations (Pro)</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground/50">
                <div className="w-5 h-5 rounded-full bg-muted/50 flex items-center justify-center">
                  <span className="text-xs">✗</span>
                </div>
                <span>Weekly insights (Pro)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card className="card-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Settings</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {menuItems.map((item) => (
                <div 
                  key={item.label}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium">{item.label}</span>
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

        {/* Disclaimer */}
        <Card className="border-border bg-muted/30">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground text-center">
              PlateCheck is a wellness support tool and is not a medical device. 
              It does not provide medical diagnosis, treatment, or clinical recommendations. 
              Always consult with your healthcare provider.
            </p>
          </CardContent>
        </Card>

        {/* Logout */}
        <Button variant="ghost" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10">
          <LogOut className="w-5 h-5 mr-2" />
          Log Out
        </Button>
      </main>

      <BottomNav onCameraClick={() => setIsMealLogOpen(true)} />
      <MealLogModal isOpen={isMealLogOpen} onClose={() => setIsMealLogOpen(false)} />
    </div>
  );
}

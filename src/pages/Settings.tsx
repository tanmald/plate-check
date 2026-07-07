import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useUserProfile } from "@/hooks/use-auth";
import { useTheme } from "@/contexts/ThemeContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { LogoutDialog } from "@/components/LogoutDialog";
import { DeletePlanDialog } from "@/components/DeletePlanDialog";
import { toast } from "sonner";
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
  Info,
  Globe,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "pt-PT", label: "Português (PT)" },
];

export default function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const [notifications, setNotifications] = useState(true);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [deletePlanDialogOpen, setDeletePlanDialogOpen] = useState(false);

  type MenuItem = {
    icon: typeof User;
    label: string;
    action?: boolean;
    toggle?: boolean;
    value?: boolean;
    onChange?: (val: boolean) => void;
    onClick?: () => void;
    danger?: boolean;
    custom?: React.ReactNode;
  };

  const handleEditProfile = () => navigate("/settings/profile");
  const handleViewPlan = () => navigate("/plan");
  const handleExportData = () => toast.info(`${t("settings.export_plan")} — ${t("settings.coming_soon")}`);
  const handleReplacePlan = () => setDeletePlanDialogOpen(true);
  const handlePrivacySettings = () => toast.info(`${t("settings.privacy_settings")} — ${t("settings.coming_soon")}`);
  const handleDeleteData = () => toast.info(`${t("settings.delete_data")} — ${t("settings.coming_soon")}`);
  const handleHelpSupport = () => toast.info(`${t("settings.help_support")} — ${t("settings.coming_soon")}`);

  const currentLang = LANGUAGES.find(l => l.code === i18n.language) ? i18n.language : "en";

  const accountItems: MenuItem[] = [
    { icon: User, label: t("settings.edit_profile"), action: true, onClick: handleEditProfile },
    { icon: Bell, label: t("settings.notifications"), toggle: true, value: notifications, onChange: setNotifications },
    { icon: Moon, label: t("settings.dark_mode"), toggle: true, value: theme === "dark", onChange: () => toggleTheme() },
    {
      icon: Globe,
      label: t("settings.language"),
      custom: (
        <Select value={currentLang} onValueChange={(lang) => i18n.changeLanguage(lang)}>
          <SelectTrigger className="w-36 h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((l) => (
              <SelectItem key={l.code} value={l.code}>
                {l.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
  ];

  const planItems: MenuItem[] = [
    { icon: FileText, label: t("settings.view_plan"), action: true, onClick: handleViewPlan },
    { icon: Download, label: t("settings.export_plan"), action: true, onClick: handleExportData },
    { icon: Trash2, label: t("settings.replace_plan"), action: true, danger: true, onClick: handleReplacePlan },
  ];

  const privacyItems: MenuItem[] = [
    { icon: Shield, label: t("settings.privacy_settings"), action: true, onClick: handlePrivacySettings },
    { icon: Trash2, label: t("settings.delete_data"), action: true, danger: true, onClick: handleDeleteData },
    { icon: HelpCircle, label: t("settings.help_support"), action: true, onClick: handleHelpSupport },
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
              className={`flex items-center justify-between px-4 py-3 ${item.action ? 'cursor-pointer hover:bg-muted/50 transition-colors' : ''}`}
              onClick={item.custom ? undefined : item.onClick}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`w-5 h-5 ${item.danger ? 'text-destructive' : 'text-muted-foreground'}`} />
                <span className={`font-medium ${item.danger ? 'text-destructive' : ''}`}>{item.label}</span>
              </div>
              {item.custom ? (
                item.custom
              ) : item.toggle ? (
                <Switch checked={item.value} onCheckedChange={item.onChange} />
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
    <div className="min-h-screen bg-background pb-6 md:pb-0">
      {/* Header */}
      <header className="bg-card border-b border-border safe-top">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground">{t("settings.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("settings.subtitle")}</p>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6 max-w-2xl mx-auto">
        {/* User Info */}
        <Card className="card-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-lg">{profile?.full_name || user?.email?.split('@')[0] || 'User'}</h2>
                <p className="text-sm text-muted-foreground">{user?.email || t("settings.no_email")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {renderMenuSection(accountItems, t("settings.account"))}
        {renderMenuSection(planItems, t("settings.plan_management"))}
        {renderMenuSection(privacyItems, t("settings.privacy_data"))}

        {/* App Info */}
        <Card className="card-shadow">
          <CardContent className="p-4">
            <div className="text-center text-sm text-muted-foreground">
              <p className="font-medium">{t("settings.version")}</p>
              <p className="mt-1">{t("settings.made_with")}</p>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Card className="border-border bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                {t("settings.disclaimer")}
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
          {t("settings.logout")}
        </Button>
      </main>

      <LogoutDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen} />
      <DeletePlanDialog open={deletePlanDialogOpen} onOpenChange={setDeletePlanDialogOpen} />
    </div>
  );
}

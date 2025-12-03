import { User, Bell, Lock, Globe, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { PageLayout } from "../components/PageLayout";

export function Settings() {
  const [isDark, setIsDark] = useState(false);

  const settingsSections = [
    {
      title: "Profil",
      icon: User,
      items: [
        { label: "Nom d'utilisateur", value: "john.doe" },
        { label: "Email", value: "john.doe@example.com" },
      ],
    },
    {
      title: "Notifications",
      icon: Bell,
      items: [
        { label: "Rappels de budget", value: "Activé" },
        { label: "Alertes de dépenses", value: "Activé" },
      ],
    },
    {
      title: "Sécurité",
      icon: Lock,
      items: [
        { label: "Authentification à deux facteurs", value: "Désactivé" },
        { label: "Dernière connexion", value: "Il y a 2 heures" },
      ],
    },
  ];

  return (
    <PageLayout
      title="Paramètres"
      description="Gérez vos préférences et votre compte"
    >
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isDark ? (
              <Moon className="h-5 w-5 text-primary" />
            ) : (
              <Sun className="h-5 w-5 text-primary" />
            )}
            <div>
              <p className="font-medium">Thème de l'application</p>
              <p className="text-sm text-muted-foreground">
                Basculer entre le mode clair et sombre
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsDark(!isDark)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isDark ? "bg-primary" : "bg-muted"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isDark ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {settingsSections.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.title} className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <Icon className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">{section.title}</h2>
              </div>
              <div className="space-y-3">
                {section.items.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between py-2"
                  >
                    <span className="text-sm text-muted-foreground">
                      {item.label}
                    </span>
                    <span className="text-sm font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Globe className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Langue et région</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">Langue</span>
            <span className="text-sm font-medium">Français</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">Devise</span>
            <span className="text-sm font-medium">EUR (€)</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
          Annuler
        </button>
        <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
          Enregistrer les modifications
        </button>
      </div>
    </PageLayout>
  );
}

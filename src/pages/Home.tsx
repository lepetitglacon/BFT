import { Wallet, TrendingDown, PiggyBank, CreditCard } from "lucide-react";
import { PageLayout } from "../components/PageLayout";

export function Home() {
  const stats = [
    {
      title: "Dépenses totales",
      value: "2,450€",
      icon: TrendingDown,
      color: "text-red-500",
    },
    {
      title: "Budget restant",
      value: "1,550€",
      icon: PiggyBank,
      color: "text-green-500",
    },
    {
      title: "Transactions",
      value: "47",
      icon: CreditCard,
      color: "text-blue-500",
    },
  ];

  return (
    <PageLayout
      title="Tableau de bord"
      description="Vue d'ensemble de vos finances"
    >
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="rounded-lg border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <Icon className={`h-10 w-10 ${stat.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-2xl font-semibold mb-4">Transactions récentes</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Courses alimentaires</p>
                <p className="text-sm text-muted-foreground">Il y a 2 heures</p>
              </div>
            </div>
            <span className="font-semibold text-red-500">-45.50€</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Abonnement Netflix</p>
                <p className="text-sm text-muted-foreground">Hier</p>
              </div>
            </div>
            <span className="font-semibold text-red-500">-13.99€</span>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

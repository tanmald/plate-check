import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Plan page skeleton
export function PlanPageSkeleton() {
  return (
    <div className="space-y-4 animate-fade-up">
      {/* Plan info skeleton */}
      <Card className="card-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meal templates header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-16" />
      </div>

      {/* Meal template cards skeleton */}
      {[0, 1, 2, 3].map((i) => (
        <MealTemplateCardSkeleton key={i} delay={i * 100} />
      ))}

      {/* Daily targets skeleton */}
      <Card className="card-shadow">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-28" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="text-center space-y-2">
                <Skeleton className="h-8 w-16 mx-auto" />
                <Skeleton className="h-3 w-12 mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Single meal template card skeleton
function MealTemplateCardSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <Card
      className="card-shadow animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-24" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-lg" />
              <Skeleton className="h-6 w-16 rounded-lg" />
              <Skeleton className="h-6 w-16 rounded-lg" />
            </div>
          </div>
          <Skeleton className="w-5 h-5 rounded" />
        </div>
      </CardContent>
    </Card>
  );
}

// Home page skeleton
export function HomePageSkeleton() {
  return (
    <div className="space-y-6 animate-fade-up">
      {/* Daily score card skeleton */}
      <Card className="card-shadow overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-gradient-to-br from-primary/5 to-secondary p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex gap-3">
                  <Skeleton className="h-10 w-24 rounded-lg" />
                  <Skeleton className="h-10 w-20 rounded-lg" />
                </div>
              </div>
              <Skeleton className="w-24 h-24 rounded-full" />
            </div>
          </div>
          <div className="p-4 border-t border-border space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-3 w-full rounded-full" />
          </div>
        </CardContent>
      </Card>

      {/* CTA skeleton */}
      <Skeleton className="h-14 w-full rounded-xl" />

      {/* Meals section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Card
              key={i}
              className="card-shadow animate-fade-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="w-12 h-12 rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// Progress page skeleton
export function ProgressPageSkeleton() {
  return (
    <div className="space-y-6 animate-fade-up">
      {/* Date navigator skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div className="text-center space-y-1">
          <Skeleton className="h-5 w-16 mx-auto" />
          <Skeleton className="h-4 w-24 mx-auto" />
        </div>
        <Skeleton className="w-10 h-10 rounded-lg" />
      </div>

      {/* Daily score card skeleton */}
      <Card className="card-shadow">
        <CardContent className="p-6 flex flex-col items-center">
          <Skeleton className="w-20 h-20 rounded-full mb-3" />
          <Skeleton className="h-6 w-20 mb-2" />
          <Skeleton className="h-4 w-28" />
        </CardContent>
      </Card>

      {/* Meals section */}
      <div>
        <Skeleton className="h-6 w-28 mb-4" />
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Card
              key={i}
              className="card-shadow animate-fade-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Insights skeleton */}
      <Card className="card-shadow">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-28" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <Skeleton className="w-5 h-5 rounded" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

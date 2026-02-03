import {
    Avatar,
    AvatarFallback,
    AvatarImage,
  } from "@/components/ui/avatar"
  import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
  import { recentSalesData } from "@/lib/data"
  
  export function RecentSalesCard() {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Recent Sales</CardTitle>
          <CardDescription>
            You made 265 sales this month.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {recentSalesData.map((sale, index) => (
                <div key={index} className="flex items-center">
                    <Avatar className="h-9 w-9">
                    <AvatarImage src={sale.avatar} alt="Avatar" />
                    <AvatarFallback>{sale.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{sale.name}</p>
                    <p className="text-sm text-muted-foreground">
                        {sale.email}
                    </p>
                    </div>
                    <div className="ml-auto font-medium">+${sale.sale.toFixed(2)}</div>
                </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }
  
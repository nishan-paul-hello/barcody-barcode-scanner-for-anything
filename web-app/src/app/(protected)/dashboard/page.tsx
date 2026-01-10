export default function DashboardPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-4 text-3xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">
        Welcome to your protected dashboard!
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-card rounded-xl border p-6 shadow-sm">
          <h2 className="mb-2 text-xl font-semibold">Total Scans</h2>
          <p className="text-4xl font-bold">1,234</p>
        </div>
        <div className="bg-card rounded-xl border p-6 shadow-sm">
          <h2 className="mb-2 text-xl font-semibold">Active Products</h2>
          <p className="text-4xl font-bold">56</p>
        </div>
        <div className="bg-card rounded-xl border p-6 shadow-sm">
          <h2 className="mb-2 text-xl font-semibold">Recent Activity</h2>
          <p className="text-muted-foreground text-sm">
            Scanned &quot;Coffee beans&quot; 2 mins ago
          </p>
        </div>
      </div>
    </div>
  );
}

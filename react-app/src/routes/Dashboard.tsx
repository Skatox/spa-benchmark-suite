import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

import KpiCard from '../components/KpiCard';
import MiniBar from '../components/MiniBar';
import { useItemsStore } from '../store';

const DashboardRoute = () => {
  const summary = useItemsStore((state) => state.summary);
  const items = useItemsStore((state) => state.items);
  const hasLoaded = useItemsStore((state) => state.hasLoaded);
  const fetchItems = useItemsStore((state) => state.fetchItems);
  const refreshSummary = useItemsStore((state) => state.refreshSummary);

  useEffect(() => {
    refreshSummary();
    if (!hasLoaded) {
      fetchItems();
    }
  }, [refreshSummary, hasLoaded, fetchItems]);

  const categorySnapshot = useMemo(() => {
    const counts = new Map<string, number>();
    items.forEach((item) => {
      counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
    });
    const entries = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
    return {
      labels: entries.map(([label]) => label.slice(0, 4)),
      values: entries.map(([, value]) => value),
    };
  }, [items]);

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Dashboard</h2>
          <p className="text-sm text-slate-600">
            Track overall catalog performance and jump into item management flows.
          </p>
        </div>
        <Link
          to="/items"
          className="inline-flex items-center justify-center rounded bg-brand px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-dark"
        >
          Manage items
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total items" value={summary.total} />
        <KpiCard label="Average price" value={`$${summary.averagePrice.toLocaleString()}`} />
        <KpiCard label="Average rating" value={summary.averageRating.toFixed(1)} />
        <KpiCard label="Out of stock" value={summary.outOfStock} helperText="Records currently unavailable" />
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Category snapshot</h3>
        <p className="text-sm text-slate-600">
          Based on the currently loaded data set. Navigate to the items page for richer exploration.
        </p>
        <div className="mt-6">
          {categorySnapshot.values.length ? (
            <MiniBar values={categorySnapshot.values} labels={categorySnapshot.labels} />
          ) : (
            <p className="text-sm text-slate-500">Load the catalog to see category distribution.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default DashboardRoute;

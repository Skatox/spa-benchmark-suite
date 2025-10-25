import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import KpiCard from '../components/KpiCard';
import MiniBar from '../components/MiniBar';
import type { Item } from '../api/items';
import { get } from '../api/items';

const ItemDetailRoute = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<Item | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      return;
    }
    setLoading(true);
    get(Number(id))
      .then((record) => {
        setItem(record);
        setError(null);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Unable to load the item.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <p className="text-sm text-slate-500">Loading item…</p>;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-red-600">{error}</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
        >
          Go back
        </button>
      </div>
    );
  }

  if (!item) {
    return <p className="text-sm text-slate-500">Item was not found.</p>;
  }

  const stockStatus = item.status === 'active' ? 'In stock' : 'Out of stock';
  const ratingBars = [item.rating, Math.max(0, 5 - item.rating), item.price / 100];

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">{item.name}</h2>
          <p className="text-sm text-slate-600">SKU {item.sku}</p>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/items/${item.id}/edit`}
            className="rounded bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Edit item
          </Link>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
          >
            Back
          </button>
        </div>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Price" value={`$${item.price.toFixed(2)}`} />
        <KpiCard label="Rating" value={item.rating.toFixed(1)} />
        <KpiCard label="Stock" value={item.stock} helperText={stockStatus} />
        <KpiCard label="Category" value={item.category} />
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Details</h3>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase text-slate-500">Created</dt>
            <dd className="text-sm text-slate-700">{new Date(item.createdAt).toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-slate-500">Updated</dt>
            <dd className="text-sm text-slate-700">{new Date(item.updatedAt).toLocaleString()}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-semibold uppercase text-slate-500">Description</dt>
            <dd className="text-sm text-slate-700">{item.description}</dd>
          </div>
        </dl>
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-slate-700">Performance ratio</h4>
          <MiniBar values={ratingBars} labels={['Rate', 'Gap', 'Price']} />
        </div>
      </div>
    </section>
  );
};

export default ItemDetailRoute;

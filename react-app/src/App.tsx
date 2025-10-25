import { Suspense, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import Nav from './components/Nav';
import DashboardRoute from './routes/Dashboard';
import AboutRoute from './routes/About';
import ItemDetailRoute from './routes/ItemDetail';
import ItemFormRoute from './routes/ItemForm';
import ItemsRoute from './routes/Items';
import { METRICS, measure } from './utils/perf';

const App = () => {
  useEffect(() => {
    measure(METRICS.FIRST_ROUTE_MOUNTED, METRICS.APP_START);
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-100">
        <header className="bg-white shadow">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <h1 className="text-xl font-semibold text-slate-900">SPA Benchmark Suite</h1>
            <Nav />
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">
          <Suspense fallback={<p className="text-slate-500">Loading route…</p>}>
            <Routes>
              <Route path="/" element={<DashboardRoute />} />
              <Route path="/items" element={<ItemsRoute />} />
              <Route path="/items/new" element={<ItemFormRoute mode="create" />} />
              <Route path="/items/:id" element={<ItemDetailRoute />} />
              <Route path="/items/:id/edit" element={<ItemFormRoute mode="edit" />} />
              <Route path="/about" element={<AboutRoute />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;

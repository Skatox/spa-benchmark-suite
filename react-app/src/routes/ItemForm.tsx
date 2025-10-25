import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import type { Item } from '../api/items';
import { get } from '../api/items';
import { useItemsStore } from '../store';
import { METRICS, mark, measure } from '../utils/perf';
import { validateItemForm, type ItemFormValues, type ValidationErrors } from '../utils/validators';

interface ItemFormRouteProps {
  mode: 'create' | 'edit';
}

const emptyForm: ItemFormValues = {
  name: '',
  category: '',
  price: '',
  rating: '',
  stock: '',
  description: '',
};

const ItemFormRoute = ({ mode }: ItemFormRouteProps) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const categories = useItemsStore((state) => state.categories);
  const loadCategories = useItemsStore((state) => state.loadCategories);
  const createItem = useItemsStore((state) => state.createItem);
  const updateItem = useItemsStore((state) => state.updateItem);

  const [values, setValues] = useState<ItemFormValues>(emptyForm);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(mode === 'edit');
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    if (mode === 'edit' && id) {
      get(Number(id))
        .then((item: Item) => {
          setValues({
            name: item.name,
            category: item.category,
            price: item.price,
            rating: item.rating,
            stock: item.stock,
            description: item.description,
          });
        })
        .catch((error: unknown) => {
          setSubmitError(error instanceof Error ? error.message : 'Unable to load the item.');
        })
        .finally(() => setLoading(false));
    }
  }, [mode, id]);

  const handleChange = (field: keyof ItemFormValues) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const value = event.target.type === 'number' ? Number(event.target.value) : event.target.value;
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validateItemForm(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setSubmitError(null);
    const payload = {
      name: values.name,
      category: values.category,
      price: Number(values.price),
      rating: Number(values.rating),
      stock: Number(values.stock),
      description: values.description,
    };

    mark(`${METRICS.FORM_SUBMIT_SUCCESS}:start`);

    try {
      if (mode === 'edit' && id) {
        await updateItem(Number(id), payload);
      } else {
        await createItem(payload);
      }
      measure(METRICS.FORM_SUBMIT_SUCCESS, `${METRICS.FORM_SUBMIT_SUCCESS}:start`);
      navigate('/items');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to submit the form.');
    }
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-slate-900">
          {mode === 'edit' ? 'Edit item' : 'Create item'}
        </h2>
        <p className="text-sm text-slate-600">
          Provide accurate product details to keep the catalog consistent and actionable.
        </p>
      </header>
      {submitError ? (
        <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
          {submitError}
        </div>
      ) : null}
      {loading ? <p className="text-sm text-slate-500">Loading form…</p> : null}
      {!loading ? (
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
                Name
              </label>
              <input
                id="name"
                name="name"
                value={values.name}
                onChange={handleChange('name')}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? 'name-error' : undefined}
                className="w-full rounded border border-slate-300 px-3 py-2"
              />
              {errors.name ? (
                <p id="name-error" className="mt-1 text-xs text-red-600">
                  {errors.name}
                </p>
              ) : null}
            </div>
            <div>
              <label htmlFor="category" className="mb-1 block text-sm font-medium text-slate-700">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={values.category}
                onChange={handleChange('category')}
                aria-invalid={Boolean(errors.category)}
                aria-describedby={errors.category ? 'category-error' : undefined}
                className="w-full rounded border border-slate-300 px-3 py-2"
              >
                <option value="">Select a category</option>
                {categories
                  .filter((category) => category !== 'all')
                  .map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
              </select>
              {errors.category ? (
                <p id="category-error" className="mt-1 text-xs text-red-600">
                  {errors.category}
                </p>
              ) : null}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="price" className="mb-1 block text-sm font-medium text-slate-700">
                Price
              </label>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                value={values.price}
                onChange={handleChange('price')}
                aria-invalid={Boolean(errors.price)}
                aria-describedby={errors.price ? 'price-error' : undefined}
                className="w-full rounded border border-slate-300 px-3 py-2"
              />
              {errors.price ? (
                <p id="price-error" className="mt-1 text-xs text-red-600">
                  {errors.price}
                </p>
              ) : null}
            </div>
            <div>
              <label htmlFor="rating" className="mb-1 block text-sm font-medium text-slate-700">
                Rating
              </label>
              <input
                id="rating"
                name="rating"
                type="number"
                step="0.1"
                min={1}
                max={5}
                value={values.rating}
                onChange={handleChange('rating')}
                aria-invalid={Boolean(errors.rating)}
                aria-describedby={errors.rating ? 'rating-error' : undefined}
                className="w-full rounded border border-slate-300 px-3 py-2"
              />
              {errors.rating ? (
                <p id="rating-error" className="mt-1 text-xs text-red-600">
                  {errors.rating}
                </p>
              ) : null}
            </div>
            <div>
              <label htmlFor="stock" className="mb-1 block text-sm font-medium text-slate-700">
                Stock
              </label>
              <input
                id="stock"
                name="stock"
                type="number"
                value={values.stock}
                onChange={handleChange('stock')}
                aria-invalid={Boolean(errors.stock)}
                aria-describedby={errors.stock ? 'stock-error' : undefined}
                className="w-full rounded border border-slate-300 px-3 py-2"
              />
              {errors.stock ? (
                <p id="stock-error" className="mt-1 text-xs text-red-600">
                  {errors.stock}
                </p>
              ) : null}
            </div>
          </div>
          <div>
            <label htmlFor="description" className="mb-1 block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={values.description}
              onChange={handleChange('description')}
              aria-invalid={Boolean(errors.description)}
              aria-describedby={errors.description ? 'description-error' : undefined}
              rows={4}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            {errors.description ? (
              <p id="description-error" className="mt-1 text-xs text-red-600">
                {errors.description}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="rounded bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              {mode === 'edit' ? 'Save changes' : 'Create item'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}
    </section>
  );
};

export default ItemFormRoute;

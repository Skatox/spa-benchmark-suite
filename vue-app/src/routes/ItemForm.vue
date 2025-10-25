<script setup lang="ts">
import { reactive, ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';

import type { Item } from '../api/items';
import { get } from '../api/items';
import { useItemsStore } from '../store';
import { METRICS, mark, measure } from '../utils/perf';
import { validateItemForm, type ItemFormValues, type ValidationErrors } from '../utils/validators';

const props = defineProps<{ mode: 'create' | 'edit' }>();

const route = useRoute();
const router = useRouter();
const itemsStore = useItemsStore();
const { categories } = storeToRefs(itemsStore);

const values = reactive<ItemFormValues>({
  name: '',
  category: '',
  price: '',
  rating: '',
  stock: '',
  description: '',
});

const errors = reactive<ValidationErrors>({});
const loading = ref(props.mode === 'edit');
const submitError = ref<string | null>(null);

const availableCategories = computed(() => categories.value.filter((category) => category !== 'all'));

const populateValues = (item: Item) => {
  values.name = item.name;
  values.category = item.category;
  values.price = item.price;
  values.rating = item.rating;
  values.stock = item.stock;
  values.description = item.description;
};

onMounted(() => {
  itemsStore.loadCategories();
  if (props.mode === 'edit') {
    const idParam = route.params.id;
    if (!idParam) {
      submitError.value = 'Item identifier is missing.';
      loading.value = false;
      return;
    }
    get(Number(idParam))
      .then((item) => {
        populateValues(item);
      })
      .catch((error: unknown) => {
        submitError.value = error instanceof Error ? error.message : 'Unable to load the item.';
      })
      .finally(() => {
        loading.value = false;
      });
  }
});

const handleChange = (field: keyof ItemFormValues, value: string | number) => {
  (values as Record<string, unknown>)[field] = value;
};

const handleSubmit = async () => {
  const validationErrors = validateItemForm(values);
  Object.assign(errors, { name: undefined, category: undefined, price: undefined, rating: undefined, stock: undefined, description: undefined }, validationErrors);

  if (Object.keys(validationErrors).length > 0) {
    return;
  }

  submitError.value = null;
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
    if (props.mode === 'edit' && route.params.id) {
      await itemsStore.updateItem(Number(route.params.id), payload);
    } else {
      await itemsStore.createItem(payload);
    }
    measure(METRICS.FORM_SUBMIT_SUCCESS, `${METRICS.FORM_SUBMIT_SUCCESS}:start`);
    router.push('/items');
  } catch (error) {
    submitError.value = error instanceof Error ? error.message : 'Unable to submit the form.';
  }
};
</script>

<template>
  <section class="space-y-6">
    <header class="flex flex-col gap-2">
      <h2 class="text-2xl font-semibold text-slate-900">
        {{ props.mode === 'edit' ? 'Edit item' : 'Create item' }}
      </h2>
      <p class="text-sm text-slate-600">
        Provide accurate product details to keep the catalog consistent and actionable.
      </p>
    </header>
    <div v-if="submitError" class="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
      {{ submitError }}
    </div>
    <p v-if="loading" class="text-sm text-slate-500">Loading form…</p>
    <form v-if="!loading" class="space-y-4" novalidate @submit.prevent="handleSubmit">
      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label for="name" class="mb-1 block text-sm font-medium text-slate-700">Name</label>
          <input
            id="name"
            v-model="values.name"
            class="w-full rounded border border-slate-300 px-3 py-2"
            :aria-invalid="Boolean(errors.name)"
            :aria-describedby="errors.name ? 'name-error' : undefined"
          />
          <p v-if="errors.name" id="name-error" class="mt-1 text-xs text-red-600">{{ errors.name }}</p>
        </div>
        <div>
          <label for="category" class="mb-1 block text-sm font-medium text-slate-700">Category</label>
          <select
            id="category"
            v-model="values.category"
            class="w-full rounded border border-slate-300 px-3 py-2"
            :aria-invalid="Boolean(errors.category)"
            :aria-describedby="errors.category ? 'category-error' : undefined"
          >
            <option value="">Select a category</option>
            <option v-for="category in availableCategories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
          <p v-if="errors.category" id="category-error" class="mt-1 text-xs text-red-600">{{ errors.category }}</p>
        </div>
      </div>
      <div class="grid gap-4 sm:grid-cols-3">
        <div>
          <label for="price" class="mb-1 block text-sm font-medium text-slate-700">Price</label>
          <input
            id="price"
            type="number"
            step="0.01"
            :value="values.price"
            class="w-full rounded border border-slate-300 px-3 py-2"
            :aria-invalid="Boolean(errors.price)"
            :aria-describedby="errors.price ? 'price-error' : undefined"
            @input="handleChange('price', ($event.target as HTMLInputElement).value === '' ? '' : Number(($event.target as HTMLInputElement).value))"
          />
          <p v-if="errors.price" id="price-error" class="mt-1 text-xs text-red-600">{{ errors.price }}</p>
        </div>
        <div>
          <label for="rating" class="mb-1 block text-sm font-medium text-slate-700">Rating</label>
          <input
            id="rating"
            type="number"
            step="0.1"
            min="1"
            max="5"
            :value="values.rating"
            class="w-full rounded border border-slate-300 px-3 py-2"
            :aria-invalid="Boolean(errors.rating)"
            :aria-describedby="errors.rating ? 'rating-error' : undefined"
            @input="handleChange('rating', ($event.target as HTMLInputElement).value === '' ? '' : Number(($event.target as HTMLInputElement).value))"
          />
          <p v-if="errors.rating" id="rating-error" class="mt-1 text-xs text-red-600">{{ errors.rating }}</p>
        </div>
        <div>
          <label for="stock" class="mb-1 block text-sm font-medium text-slate-700">Stock</label>
          <input
            id="stock"
            type="number"
            :value="values.stock"
            class="w-full rounded border border-slate-300 px-3 py-2"
            :aria-invalid="Boolean(errors.stock)"
            :aria-describedby="errors.stock ? 'stock-error' : undefined"
            @input="handleChange('stock', ($event.target as HTMLInputElement).value === '' ? '' : Number(($event.target as HTMLInputElement).value))"
          />
          <p v-if="errors.stock" id="stock-error" class="mt-1 text-xs text-red-600">{{ errors.stock }}</p>
        </div>
      </div>
      <div>
        <label for="description" class="mb-1 block text-sm font-medium text-slate-700">Description</label>
        <textarea
          id="description"
          v-model="values.description"
          rows="4"
          class="w-full rounded border border-slate-300 px-3 py-2"
          :aria-invalid="Boolean(errors.description)"
          :aria-describedby="errors.description ? 'description-error' : undefined"
        />
        <p v-if="errors.description" id="description-error" class="mt-1 text-xs text-red-600">{{ errors.description }}</p>
      </div>
      <div class="flex items-center gap-2">
        <button type="submit" class="rounded bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
          {{ props.mode === 'edit' ? 'Save changes' : 'Create item' }}
        </button>
        <button
          type="button"
          class="rounded border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
          @click="router.back()"
        >
          Cancel
        </button>
      </div>
    </form>
  </section>
</template>

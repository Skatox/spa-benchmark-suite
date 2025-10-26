export interface ItemFormValues {
  name: string;
  category: string;
  price: number | '';
  rating: number | '';
  stock: number | '';
  description: string;
}

export interface ValidationErrors {
  name?: string;
  category?: string;
  price?: string;
  rating?: string;
  stock?: string;
  description?: string;
}

const REQUIRED_MESSAGE = 'This field is required.';

export function validateItemForm(values: ItemFormValues): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!values.name.trim()) {
    errors.name = REQUIRED_MESSAGE;
  }

  if (!values.category.trim()) {
    errors.category = REQUIRED_MESSAGE;
  }

  if (values.price === '' || Number.isNaN(Number(values.price))) {
    errors.price = 'Price must be a number.';
  } else if (Number(values.price) <= 0) {
    errors.price = 'Price must be greater than zero.';
  }

  if (values.rating === '' || Number.isNaN(Number(values.rating))) {
    errors.rating = 'Rating must be between 1 and 5.';
  } else if (Number(values.rating) < 1 || Number(values.rating) > 5) {
    errors.rating = 'Rating must be between 1 and 5.';
  }

  if (values.stock === '' || Number.isNaN(Number(values.stock))) {
    errors.stock = 'Stock must be a valid number.';
  } else if (Number(values.stock) < 0) {
    errors.stock = 'Stock cannot be negative.';
  }

  if (!values.description.trim()) {
    errors.description = REQUIRED_MESSAGE;
  }

  return errors;
}

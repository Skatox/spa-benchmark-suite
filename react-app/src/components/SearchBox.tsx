import { ChangeEvent, memo } from 'react';

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchBoxComponent = ({ value, onChange, placeholder }: SearchBoxProps) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <div className="flex flex-1 items-center gap-2">
      <label htmlFor="search" className="sr-only">
        Search items
      </label>
      <input
        id="search"
        type="search"
        value={value}
        onChange={handleChange}
        placeholder={placeholder ?? 'Search by name, SKU, or description'}
        className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
      />
    </div>
  );
};

const SearchBox = memo(SearchBoxComponent);

export default SearchBox;

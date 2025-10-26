<script lang="ts">
  export interface TableColumn<T = Record<string, unknown>> {
    key: string;
    header: string;
    className?: string;
    align?: 'left' | 'center' | 'right';
    render?: (row: T) => unknown;
  }

  export let data: Record<string, unknown>[] = [];
  export let columns: TableColumn[] = [];
  export let emptyMessage = 'No records found.';
</script>

{#if data.length === 0}
  <div class="rounded border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">{emptyMessage}</div>
{:else}
  <div class="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
    <table class="min-w-full divide-y divide-slate-200">
      <thead class="bg-slate-50">
        <tr>
          {#each columns as column}
            <th
              scope="col"
              class={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 ${
                column.className ?? ''
              }`}
            >
              {column.header}
            </th>
          {/each}
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100 bg-white">
        {#each data as row (row.id ?? JSON.stringify(row))}
          <tr class="hover:bg-slate-50">
            {#each columns as column}
              <td class={`px-4 py-3 text-sm text-slate-700 ${column.className ?? ''}`}>
                <slot name={`cell-${column.key}`} {row}>
                  {#if column.render}
                    {column.render(row)}
                  {:else}
                    {row[column.key]}
                  {/if}
                </slot>
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}

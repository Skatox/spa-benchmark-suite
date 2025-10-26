<script lang="ts">
  import {
    Dialog,
    DialogDescription,
    DialogOverlay,
    DialogTitle,
    TransitionChild,
    TransitionRoot,
  } from '@rgossiaux/svelte-headlessui';
  import { createEventDispatcher } from 'svelte';

  export let open = false;
  export let title: string;
  export let description: string;
  export let confirmLabel = 'Confirm';
  export let cancelLabel = 'Cancel';

  const dispatch = createEventDispatcher<{ confirm: void; cancel: void }>();

  function handleClose() {
    dispatch('cancel');
  }

  function handleConfirm() {
    dispatch('confirm');
  }
</script>

<TransitionRoot show={open} as="div" class="relative z-50">
  <Dialog as="div" class="relative z-50" on:close={handleClose}>
    <TransitionChild
      as={DialogOverlay}
      class="fixed inset-0 bg-slate-900/40"
      enter="ease-out duration-200"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="ease-in duration-150"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    />
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <TransitionChild
        as="div"
        class="w-full max-w-md"
        enter="ease-out duration-200"
        enterFrom="opacity-0 translate-y-4"
        enterTo="opacity-100 translate-y-0"
        leave="ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-4"
      >
        <div class="rounded-lg bg-white p-6 shadow-xl">
          <DialogTitle class="text-lg font-semibold text-slate-900">{title}</DialogTitle>
          <DialogDescription class="mt-2 text-sm text-slate-600">{description}</DialogDescription>
          <div class="mt-6 flex justify-end gap-2">
            <button
              type="button"
              class="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              on:click={handleClose}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              class="rounded bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
              on:click={handleConfirm}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </TransitionChild>
    </div>
  </Dialog>
</TransitionRoot>

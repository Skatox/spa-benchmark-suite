<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue';

defineProps<{
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}>();
</script>

<template>
  <TransitionRoot :show="open" as="template">
    <Dialog as="div" class="relative z-50" @close="onCancel">
      <TransitionChild
        as="template"
        enter="ease-out duration-200"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-150"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-slate-900/40" />
      </TransitionChild>

      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <TransitionChild
          as="template"
          enter="ease-out duration-200"
          enter-from="opacity-0 translate-y-4"
          enter-to="opacity-100 translate-y-0"
          leave="ease-in duration-150"
          leave-from="opacity-100 translate-y-0"
          leave-to="opacity-0 translate-y-4"
        >
          <DialogPanel class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <DialogTitle class="text-lg font-semibold text-slate-900">{{ title }}</DialogTitle>
            <p class="mt-2 text-sm text-slate-600">{{ description }}</p>
            <div class="mt-6 flex justify-end gap-2">
              <button
                type="button"
                class="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                @click="onCancel"
              >
                {{ cancelLabel ?? 'Cancel' }}
              </button>
              <button
                type="button"
                class="rounded bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
                @click="onConfirm"
              >
                {{ confirmLabel ?? 'Confirm' }}
              </button>
            </div>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

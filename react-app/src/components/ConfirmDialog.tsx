import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => (
  <Transition.Root show={open} as={Fragment}>
    <Dialog as="div" className="relative z-50" onClose={onCancel}>
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-200"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-slate-900/40" />
      </Transition.Child>

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0 translate-y-4"
          enterTo="opacity-100 translate-y-0"
          leave="ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-4"
        >
          <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <Dialog.Title className="text-lg font-semibold text-slate-900">{title}</Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-slate-600">
              {description}
            </Dialog.Description>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="rounded bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
              >
                {confirmLabel}
              </button>
            </div>
          </Dialog.Panel>
        </Transition.Child>
      </div>
    </Dialog>
  </Transition.Root>
);

export default ConfirmDialog;

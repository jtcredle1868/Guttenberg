import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

export const Modal = ({ isOpen, onClose, title, children, size = 'md' }: ModalProps) => (
  <Transition appear show={isOpen} as={Fragment}>
    <Dialog as="div" className="relative z-50" onClose={onClose}>
      {/* Backdrop */}
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-200"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div
          className="fixed inset-0"
          style={{ background: 'rgba(5,13,26,0.70)', backdropFilter: 'blur(6px)' }}
        />
      </Transition.Child>

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95 translate-y-2"
            enterTo="opacity-100 scale-100 translate-y-0"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100 translate-y-0"
            leaveTo="opacity-0 scale-95 translate-y-2"
          >
            <Dialog.Panel
              className={`w-full ${sizeMap[size]} rounded-2xl p-6 relative overflow-hidden`}
              style={{
                background: 'linear-gradient(145deg, #1a2d4e 0%, #0f2040 100%)',
                border: '1px solid rgba(212,175,55,0.20)',
                boxShadow: '0 8px 48px rgba(5,13,26,0.70), 0 0 0 1px rgba(212,175,55,0.08)',
              }}
            >
              {/* Gold top rule */}
              <div
                className="absolute top-0 left-6 right-6 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.45), transparent)' }}
              />

              {/* Inner glow */}
              <div
                className="absolute inset-0 pointer-events-none rounded-2xl"
                style={{ background: 'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(212,175,55,0.05) 0%, transparent 60%)' }}
              />

              <div className="relative z-10">
                {title && (
                  <div
                    className="flex items-center justify-between mb-5"
                    style={{ borderBottom: '1px solid rgba(61,96,128,0.20)', paddingBottom: '1rem' }}
                  >
                    <Dialog.Title
                      className="text-lg font-bold text-white"
                      style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                    >
                      {title}
                    </Dialog.Title>
                    <button
                      onClick={onClose}
                      className="p-1.5 rounded-lg transition-all duration-150"
                      style={{ color: 'rgba(90,127,160,0.60)' }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(61,96,128,0.18)';
                        e.currentTarget.style.color = '#c5d8e8';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'rgba(90,127,160,0.60)';
                      }}
                      aria-label="Close"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                )}
                {children}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </div>
    </Dialog>
  </Transition>
);

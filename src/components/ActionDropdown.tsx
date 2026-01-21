import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useClickOutside } from '../hooks/useClickOutside'

interface ActionDropdownProps {
    trigger: React.ReactNode
    children: React.ReactNode
    isOpen: boolean
    onClose: () => void
    onOpen: () => void
}

export function ActionDropdown({
    trigger,
    children,
    isOpen,
    onClose,
    onOpen,
}: ActionDropdownProps) {
    const [coords, setCoords] = useState({ top: 0, left: 0 })
    const triggerRef = useRef<HTMLDivElement>(null)

    const dropdownRef = useClickOutside<HTMLDivElement>(onClose, isOpen)

    useEffect(() => {
        if (isOpen && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect()
            setCoords({
                top: rect.bottom + window.scrollY,
                left: rect.right + window.scrollX,
            })
        }
    }, [isOpen])

    return (
        <div className="relative inline-block" ref={triggerRef}>
            <div onClick={(e) => {
                e.stopPropagation()
                isOpen ? onClose() : onOpen()
            }}>
                {trigger}
            </div>

            {isOpen && createPortal(
                <div
                    ref={dropdownRef}
                    style={{
                        position: 'absolute',
                        top: `${coords.top + 4}px`,
                        left: `${coords.left}px`,
                        transform: 'translateX(-100%)',
                    }}
                    className="z-[9999]"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 min-w-[12rem]">
                        {children}
                    </div>
                </div>,
                document.body
            )}
        </div>
    )
}

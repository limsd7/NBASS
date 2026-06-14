import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface PortalWindowProps {
    children: React.ReactNode;
    onClose: () => void;
    title?: string;
}

export const PortalWindow: React.FC<PortalWindowProps> = ({ children, onClose, title = 'New Window' }) => {
    const [container, setContainer] = useState<HTMLDivElement | null>(null);
    const newWindow = useRef<Window | null>(null);

    useEffect(() => {
        // Open new window
        const windowFeatures = 'width=1400,height=900,status=no,menubar=no,toolbar=no,clipboard-write';
        newWindow.current = window.open('', '_blank', windowFeatures);

        if (newWindow.current) {
            // Set title
            newWindow.current.document.title = title;

            // Inject Tailwind CSS via CDN for new window
            const tailwindScript = newWindow.current.document.createElement('script');
            tailwindScript.src = "https://cdn.tailwindcss.com";
            newWindow.current.document.head.appendChild(tailwindScript);

            // Copy styles from parent window
            Array.from(document.styleSheets).forEach(styleSheet => {
                try {
                    if (styleSheet.href) {
                        const newLink = newWindow.current!.document.createElement('link');
                        newLink.rel = 'stylesheet';
                        newLink.href = styleSheet.href;
                        newWindow.current!.document.head.appendChild(newLink);
                    } else if (styleSheet.cssRules) {
                        const newStyle = newWindow.current!.document.createElement('style');
                        Array.from(styleSheet.cssRules).forEach(rule => {
                            newStyle.appendChild(newWindow.current!.document.createTextNode(rule.cssText));
                        });
                        newWindow.current!.document.head.appendChild(newStyle);
                    }
                } catch (e) {
                    // Cross-origin styles might throw, safe to ignore for some
                    console.warn('Could not copy stylesheet:', e);
                }
            });

            // Add base styles particularly for Tailwind (if not covered by link/style copy)
            // Assuming Tailwind uses a global style tag or linked file, the above usually covers it.
            // However, we can add a basic reset or container if needed.
            const div = newWindow.current.document.createElement('div');
            div.id = 'portal-root';
            // Ensure specific print styles work or background looks right
            div.className = 'w-full min-h-screen bg-slate-50 overflow-auto';
            newWindow.current.document.body.appendChild(div);

            // Set body styles to match app
            newWindow.current.document.body.className = 'bg-slate-50';

            setContainer(div);

            // Handle window close
            newWindow.current.onbeforeunload = () => {
                onClose();
                return null;
            };
        }

        return () => {
            if (newWindow.current) {
                newWindow.current.close();
                newWindow.current = null;
            }
        };
    }, []); // Run once on mount

    return container ? createPortal(children, container) : null;
};

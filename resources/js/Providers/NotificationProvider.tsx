import { ReactNode } from 'react';
import { Toast } from '../Components/Toast';

export function NotificationProvider({ children }: { children: ReactNode }) {
    return (
        <>
            {children}
            <Toast />
        </>
    );
}

import {createContext, FC, ReactNode, useContext} from "react";
import {Toast, Toaster, ToastTitle, useId, useToastController} from "@fluentui/react-components";


interface ToastContextType {
    dispatchMessage: (content: string, type: "success" | "error" | "warning" | "info") => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: FC<{ children: ReactNode }> = ({children}) => {

    const toasterId = useId("toaster");
    const {dispatchToast} = useToastController(toasterId);

    const dispatchMessage = (content: string, type: "success" | "error" | "warning" | "info" = "info") => {
        dispatchToast(
            <Toast>
                <ToastTitle>{content}</ToastTitle>
            </Toast>,
            {position: "top-end", intent: type}
        );
    };

    return <ToastContext.Provider value={{dispatchMessage}}>
        {children}
        <Toaster toasterId={toasterId}/>
    </ToastContext.Provider>
}

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};
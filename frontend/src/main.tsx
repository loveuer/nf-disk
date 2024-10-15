import React from 'react'
import {createRoot} from 'react-dom/client'
import './style.css'
import {FluentProvider, webLightTheme} from '@fluentui/react-components';
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import {Home} from "./component/home/home";
import {ToastProvider} from "./message";

const container = document.getElementById('root')

const root = createRoot(container!)

const router = createBrowserRouter([
    {path: '/', element: <Home/>},
])

root.render(
    <FluentProvider theme={webLightTheme} style={{height: '100%'}}>
        <ToastProvider>
            <RouterProvider router={router}/>
        </ToastProvider>
    </FluentProvider>,
);

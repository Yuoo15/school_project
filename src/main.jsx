import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import 'normalize.css'
import {Provider} from './provider/provider'
import Reg from './components/reg/reg'


createRoot(document.getElementById('root')).render(
<React.StrictMode>
    <Provider>
        <App />
    </Provider>
</React.StrictMode>
)

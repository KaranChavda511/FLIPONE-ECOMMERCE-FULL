
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {Provider} from 'react-redux'
import {store, persistor} from "./redux/Store.js"
import { PersistGate } from 'redux-persist/integration/react'

import './index.css'
// import App from './App.jsx'
import Router from "../src/router/Router.jsx"

createRoot(document.getElementById('root')).render(
  <Provider store={store}>  
  <PersistGate loading={null} persistor={persistor}>
  <StrictMode>
    < Router/>
  </StrictMode>
  </PersistGate>
  </Provider>

)
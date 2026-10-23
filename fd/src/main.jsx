import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App.jsx";
import "./styles/index.scss";
import { PersistGate } from "redux-persist/integration/react";
import store, { persistor } from "./app/store";

createRoot(document.getElementById("root")).render(
    <>
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <App />
            </PersistGate>
        </Provider>
    </>
);




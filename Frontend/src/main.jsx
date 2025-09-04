// main.jsx or index.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import './index.css'; // ✅ for Tailwind or global styles
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider"; // ✅ if needed
//import { SocketProvider } from "./context/socketcontext";
//import { configureStore } from "@reduxjs/toolkit";
import { SocketProvider } from "./context/socketcontext";
//import { Provider } from "react-redux";
//import rootReducer from "./reducer";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient();



ReactDOM.createRoot(document.getElementById("root")).render(
 <BrowserRouter>
   <AuthProvider>
    {/* <SocketProvider>
                <App />


    </SocketProvider> */}
    <SocketProvider>
      <QueryClientProvider client={queryClient}>
      <App />
      <Toaster/>
    </QueryClientProvider>
    </SocketProvider>
    


   </AuthProvider>
    
    
  </BrowserRouter>
);

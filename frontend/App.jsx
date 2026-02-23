import React from "react";
import LoginPage from "./pages/LoginPage";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

function App() {
    return (
        <div>
            <Navbar />
            <Sidebar />
            <LoginPage />
        </div>
    );
}

export default App;

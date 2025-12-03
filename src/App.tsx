import "./App.css"
import { Route, Routes } from "react-router-dom"
import { Navbar } from "./components/Navbar"
import { Home } from "./pages/Home"
import { Expenses } from "./pages/Expenses"
import { Budget } from "./pages/Budget"
import { Settings } from "./pages/Settings"

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto px-6 py-8 max-w-7xl">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  )
}

export default App

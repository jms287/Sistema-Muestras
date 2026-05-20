import { useEffect, useState } from "react";
import SignIn from "./pantallas/common/signin.jsx";
import SignUp from "./pantallas/solicitante/signup.jsx";  // <- CAMBIAR ESTA LÍNEA
import Dashboard from "./pantallas/common/Dashboard.jsx";
import { clearAuth, getAuthUser, persistAuth } from "./utils/auth.js";

function App() {
  const [user, setUser] = useState(null)
  const [showSignUp, setShowSignUp] = useState(false)

  useEffect(() => {
    const storedUser = getAuthUser()
    if (storedUser) setUser(storedUser)
  }, [])

  const handleLogin = ({ user: authUser, token }) => {
    persistAuth(authUser, token)
    setUser(authUser)
  }

  const handleLogout = () => {
    clearAuth()
    setUser(null)
  }

  // Si hay usuario logueado, muestra el dashboard
  if (user) {
    return <Dashboard user={user} onLogout={handleLogout} />
  }

  // Si no hay usuario, muestra Sign In o Sign Up
  if (showSignUp) {
    return <SignUp onBackToSignIn={() => setShowSignUp(false)} />
  }

  return <SignIn onLogin={handleLogin} onGoToSignUp={() => setShowSignUp(true)} />
}

export default App
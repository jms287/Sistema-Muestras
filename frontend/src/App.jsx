import { useState } from "react";
import SignIn from "./pantallas/common/signin.jsx";
import SignUp from "./pantallas/solicitante/signup.jsx";  // <- CAMBIAR ESTA LÍNEA
import Dashboard from "./pantallas/common/Dashboard.jsx";

function App() {
  const [user, setUser] = useState(null)
  const [showSignUp, setShowSignUp] = useState(false)

  // Si hay usuario logueado, muestra el dashboard
  if (user) {
    return <Dashboard user={user} onLogout={() => setUser(null)} />
  }

  // Si no hay usuario, muestra Sign In o Sign Up
  if (showSignUp) {
    return <SignUp onBackToSignIn={() => setShowSignUp(false)} />
  }

  return <SignIn onLogin={setUser} onGoToSignUp={() => setShowSignUp(true)} />
}

export default App
import AppRouter from "./routes/AppRouter";
import { AuthProvider } from "./shared/context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;

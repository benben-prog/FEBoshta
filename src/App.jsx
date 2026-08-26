import './index.css';
// import Dashboard from './assistants/Exams';
import { RouterProvider } from "react-router-dom";
import { router } from "./routes.jsx";

function App() {
  return (
  <RouterProvider router={router} />
  // <Dashboard />
  );
}
export default App;
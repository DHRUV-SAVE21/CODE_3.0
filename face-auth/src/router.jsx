import {
  Navigate,
  Route,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp"; 
import Layout from "./pages/Layout";
import UserSelect from "./pages/UserSelect";
import Protected from "./pages/Protected";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="user-select" element={<UserSelect />} />
        <Route path="login" element={<Login />} />
        <Route path="sign-up" element={<SignUp />} />
        <Route path="protected" element={<Protected />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </>
  ),
  // { basename: import.meta.env.DEV ? "/" : "/react-face-auth/" }
  { basename: "/" }
);

export default router;

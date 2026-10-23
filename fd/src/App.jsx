import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { routes } from "./routes";
import "./styles/main.scss";
import "simplebar-react/dist/simplebar.min.css";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { logout } from "./features/auth/authSlice";
import useGlobalGridNavigation from "./components/common/useTableArrowNavigation";
const router = createBrowserRouter(routes);

function App() {
  const dispatch = useDispatch();
   useGlobalGridNavigation();  // For Arrow ⬆️⬇️ Feature implemented in tabuler form

  useEffect(() => {
    const handleStorageEvent = (event) => {
      // If "logout" key changes in localStorage, log out this tab
      if (event.key === "logout") {
        dispatch(logout());
      }
    };

    window.addEventListener("storage", handleStorageEvent);

    return () => {
      window.removeEventListener("storage", handleStorageEvent);
    };
  }, [dispatch]);


//     useEffect(() => {
//       const isLoggedIn = localStorage.getItem("isLoggedIn");
//       const user = localStorage.getItem("user");

//       if (isLoggedIn && user) {
//         dispatch(setCredentials(JSON.parse(user)));
//       }
//     }, [dispatch]);


//     useEffect(() => {

//   const params = new URLSearchParams(window.location.search);

//   const token = params.get("token");

//   if (token) {

//     localStorage.setItem("token", token);
//     localStorage.setItem("isLoggedIn", "true");

//     fetch(
//       `${import.meta.env.VITE_BASE_API_URL}/api/v1/auth/email-login`,
//       {
//         method: "POST",

//         headers: {
//           "Content-Type": "application/json",
//         },

//         body: JSON.stringify({ token }),
//       }
//     )
//     .then((res) => res.json())
//     .then((data) => {

//       if (data?.user) {

//         localStorage.setItem(
//           "user",
//           JSON.stringify(data.user)
//         );

//         dispatch(setCredentials(data.user));

//       }

//     });

//   }

// }, []);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          error: { style: { background: "red", color: "white"},},
        }}
      />
    </>
  );
}

export default App;

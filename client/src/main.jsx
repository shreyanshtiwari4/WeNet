import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import AppContainer from "./Appcontainer";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AppContainer />
  </BrowserRouter>
);
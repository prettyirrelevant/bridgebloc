import { Suspense } from "react";
import "@szhsin/react-menu/dist/index.css";
import { Route, Routes } from "react-router-dom";
import "@szhsin/react-menu/dist/transitions/slide.css";

import Bridge from "./pages/bridge";
import Navbar from "components/navbar";
import Conversion from "pages/conversion";
import Conversions from "pages/conversions";
import AppLoader from "components/common/loader";

import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en.json";

TimeAgo.addDefaultLocale(en);

const App = () => {
  return (
    <Suspense fallback={<AppLoader />}>
      <div className="app-container">
        <Navbar />

        <Routes>
          <Route path="/" element={<Bridge />} />
          <Route path="/conversions" element={<Conversions />} />
          <Route path="/conversion/:uuid" element={<Conversion />} />
        </Routes>
      </div>
    </Suspense>
  );
};

export default App;

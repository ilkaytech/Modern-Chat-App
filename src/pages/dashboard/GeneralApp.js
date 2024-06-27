import React, { Suspence, lazy } from "react";

// Dynamic import
const Cat = lazy(() => import("../../components/Cat"));

const GeneralApp = () => {
  return (
    <>
      <Suspence fallback="Loading...">
        <Cat />
      </Suspence>
    </>
  );
};

export default GeneralApp;

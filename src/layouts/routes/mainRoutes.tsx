// @ts-nocheck
import React from "react";
import { Route } from "react-router-dom";

// import internal(own) modules
import MainLayout from "../mainLayout";

const MainLayoutRoute = ({ render, ...rest }) => {

   return (
      <Route
         {...rest}
         component={matchProps => (
            <MainLayout matchProps={matchProps}   {...rest}>{render(matchProps)}</MainLayout>
         )}
      />
   );
};

export default MainLayoutRoute;

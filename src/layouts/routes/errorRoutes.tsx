// @ts-nocheck
import React from "react";
import { Route } from "react-router-dom";

// import internal(own) modules
import ErrorLayout from "../errorLayout";
import MainLayout from "../mainLayout";

const ErrorLayoutRoute = ({ login, render, ...rest }) => {
   if (login) {
      return (
         <Route
            {...rest}
            render={matchProps => <ErrorLayout>{render(matchProps)}</ErrorLayout>}
         />
      );
   } else {
      return (
         <Route
            {...rest}
            render={matchProps => <MainLayout>{render(matchProps)}</MainLayout>}
         />
      );
   }
};

export default ErrorLayoutRoute;

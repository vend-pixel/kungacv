import * as React from "react";
import { styled } from "@mui/material";

const AppLogo = styled("h3")({
  fontSize: "2rem",
  color: "black",
  margin: "4px",
});

const Logo = () => {
  return <AppLogo>KungaCV Admin</AppLogo>;
};

export default Logo;

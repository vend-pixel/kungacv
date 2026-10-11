import * as React from "react";
import { Layout, LayoutProps } from "react-admin";
import AppBar from "./AppBar";
import CustomSidebar from "./SideBar";

const CustomLayout = (props: LayoutProps) => (
  <Layout {...props} appBar={AppBar} sidebar={CustomSidebar} />
);

CustomLayout.displayName = "CustomLayout";

export default CustomLayout;

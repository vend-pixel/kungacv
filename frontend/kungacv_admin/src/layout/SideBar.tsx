import * as React from "react";
import { Sidebar } from "react-admin";

const CustomSidebar = (props: React.ComponentProps<typeof Sidebar>) => {
  return (
    <Sidebar
      sx={{
        ".RaSidebar-fixed ul a": {
          margin: ".6rem 0",
        },
        ".RaMenuItemLink-active": {
          fontWeight: "bold",
        },
        ".RaMenuItemLink-active svg": {
          color: "#111",
        },
      }}
      {...props}
    />
  );
};

export default CustomSidebar;

import * as React from "react";
import { Admin, Resource } from "react-admin";
import { authProvider } from "./AuthProvider";
import dataProvider from "./dataProvider";
import { Login, Layout } from "./layout";
import { Dashboard } from "./Dashboard";
import { lightTheme } from "./layout/themes";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import PaidIcon from "@mui/icons-material/Paid";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import PaymentIcon from "@mui/icons-material/Payment";
import {
  PricingCreate,
  PricingEdit,
  PricingList,
} from "./resources/Pricing";
import {
  TemplateCreate,
  TemplateEdit,
  TemplateList,
} from "./resources/Templates";
import { PaymentList, PaymentShow } from "./resources/Payments";
import { UserCreate, UserEdit, UserList } from "./resources/Users";

const App = () => (
  <Admin
    dataProvider={dataProvider}
    authProvider={authProvider}
    dashboard={Dashboard}
    loginPage={Login}
    layout={Layout}
    disableTelemetry
    theme={lightTheme}
  >
    <Resource
      name="templates"
      list={TemplateList}
      create={TemplateCreate}
      edit={TemplateEdit}
      icon={ContentPasteIcon}
    />
    <Resource
      name="users"
      list={UserList}
      create={UserCreate}
      edit={UserEdit}
      icon={PeopleAltIcon}
    />
    <Resource
      name="pricing"
      list={PricingList}
      create={PricingCreate}
      edit={PricingEdit}
      icon={PaidIcon}
    />
    <Resource
      name="payments"
      list={PaymentList}
      show={PaymentShow}
      icon={PaymentIcon}
    />
  </Admin>
);

export default App;

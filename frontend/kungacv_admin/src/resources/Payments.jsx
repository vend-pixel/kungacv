import {
  DateField,
  Datagrid,
  List,
  NumberField,
  SelectInput,
  Show,
  SimpleShowLayout,
  TextField,
  TextInput,
} from "react-admin";

const paymentFilters = [
  <SelectInput
    key="status"
    source="status"
    choices={[
      { id: "pending", name: "Pending" },
      { id: "success", name: "Success" },
      { id: "failed", name: "Failed" },
    ]}
  />,
  <TextInput key="plan" source="plan" />,
  <TextInput key="userUid" source="userUid" label="User UID" />,
  <TextInput key="txRef" source="txRef" label="Transaction reference" />,
];

export const PaymentList = () => (
  <List filters={paymentFilters} sort={{ field: "createdAt", order: "DESC" }}>
    <Datagrid rowClick="show">
      <TextField source="tx_ref" label="Transaction" />
      <TextField source="user_uid" label="User" />
      <TextField source="plan" />
      <NumberField source="amount" />
      <TextField source="currency" />
      <TextField source="status" />
      <DateField source="paid_at" />
    </Datagrid>
  </List>
);

export const PaymentShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="tx_ref" label="Transaction" />
      <TextField source="user_uid" label="User UID" />
      <TextField source="user_email" label="User email" />
      <TextField source="plan" />
      <NumberField source="amount" />
      <TextField source="currency" />
      <TextField source="status" />
      <TextField source="mode" />
      <TextField source="channel" />
      <TextField source="charge_id" />
      <DateField source="paid_at" />
      <DateField source="createdAt" />
    </SimpleShowLayout>
  </Show>
);

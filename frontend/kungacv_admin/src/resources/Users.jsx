import {
  BooleanField,
  BooleanInput,
  Create,
  Datagrid,
  Edit,
  EmailField,
  List,
  SelectInput,
  SimpleForm,
  TextField,
  TextInput,
} from "react-admin";

const userFilters = [
  <TextInput key="name" source="name" />,
  <TextInput key="email" source="email" />,
  <SelectInput
    key="active"
    source="active"
    choices={[
      { id: "true", name: "Active" },
      { id: "false", name: "Inactive" },
    ]}
  />,
];

const UserForm = ({ create = false }) => (
  <SimpleForm>
    <TextInput source="name" required fullWidth />
    <TextInput source="email" type="email" required fullWidth />
    {create && <TextInput source="password" type="password" required fullWidth />}
    {!create && <TextInput source="newPassword" type="password" helperText="Leave blank to keep the current password" fullWidth />}
    <SelectInput
      source="role"
      choices={[
        { id: "user", name: "User" },
        { id: "admin", name: "Administrator" },
      ]}
      defaultValue="user"
    />
    <BooleanInput source="active" defaultValue />
  </SimpleForm>
);

export const UserList = () => (
  <List filters={userFilters}>
    <Datagrid rowClick="edit">
      <TextField source="uid" label="UID" />
      <TextField source="name" />
      <EmailField source="email" />
      <TextField source="role" />
      <BooleanField source="active" />
      <BooleanField source="isPro" label="Pro" />
    </Datagrid>
  </List>
);

export const UserCreate = () => (
  <Create>
    <UserForm create />
  </Create>
);

export const UserEdit = () => (
  <Edit>
    <UserForm />
  </Edit>
);

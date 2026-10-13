import {
  BooleanField,
  BooleanInput,
  Button,
  Create,
  Datagrid,
  Edit,
  EditButton,
  List,
  NumberField,
  NumberInput,
  SelectInput,
  SimpleForm,
  TextField,
  TextInput,
  TopToolbar,
  useDataProvider,
  useNotify,
  useRecordContext,
  useRefresh,
} from "react-admin";

const pricingFilters = [
  <TextInput key="search" source="search" alwaysOn />,
  <SelectInput
    key="active"
    source="active"
    choices={[
      { id: "true", name: "Active" },
      { id: "false", name: "Inactive" },
    ]}
  />,
];

function PricingLifecycleButton({ action, label }) {
  const record = useRecordContext();
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const refresh = useRefresh();

  if (!record) return null;
  return (
    <Button
      label={label}
      onClick={async (event) => {
        event.stopPropagation();
        try {
          await dataProvider[action](record.uid);
          notify(`${label} complete`, { type: "info" });
          refresh();
        } catch (error) {
          notify(error.message || `${label} failed`, { type: "warning" });
        }
      }}
    />
  );
}

const PricingActions = () => (
  <TopToolbar>
    <EditButton />
  </TopToolbar>
);

const PricingForm = () => (
  <SimpleForm>
    <TextInput source="name" required fullWidth />
    <TextInput source="slug" helperText="Lowercase URL-safe package slug" fullWidth />
    <TextInput source="description" multiline fullWidth />
    <NumberInput source="price" min={0} required />
    <TextInput source="currency" defaultValue="MWK" />
    <NumberInput source="duration" label="Duration (days)" min={1} required />
    <NumberInput source="sortOrder" min={0} defaultValue={0} />
    <BooleanInput source="active" defaultValue />
  </SimpleForm>
);

export const PricingList = () => (
  <List filters={pricingFilters} sort={{ field: "sortOrder", order: "ASC" }}>
    <Datagrid rowClick="edit">
      <TextField source="name" />
      <TextField source="slug" />
      <NumberField source="price" />
      <TextField source="currency" />
      <NumberField source="duration" label="Days" />
      <BooleanField source="active" />
      <PricingLifecycleButton action="activatePricing" label="Activate" />
      <PricingLifecycleButton action="disablePricing" label="Disable" />
    </Datagrid>
  </List>
);

export const PricingCreate = () => (
  <Create>
    <PricingForm />
  </Create>
);

export const PricingEdit = () => (
  <Edit actions={<PricingActions />}>
    <PricingForm />
  </Edit>
);

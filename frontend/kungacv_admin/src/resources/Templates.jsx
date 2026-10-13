import {
  BooleanField,
  Button,
  Create,
  Datagrid,
  Edit,
  List,
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
import { useRef } from "react";

const templateFilters = [
  <TextInput key="search" source="search" alwaysOn />,
  <SelectInput
    key="access"
    source="access"
    choices={[
      { id: "free", name: "Free" },
      { id: "paid", name: "Paid" },
    ]}
  />,
  <SelectInput
    key="published"
    source="published"
    choices={[
      { id: "true", name: "Published" },
      { id: "false", name: "Draft" },
    ]}
  />,
];

const parseConfig = (value) => {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const formatConfig = (value) =>
  typeof value === "string" ? value : JSON.stringify(value || {}, null, 2);

const parsePackageUids = (value) =>
  typeof value === "string"
    ? value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : value;

const formatPackageUids = (value) =>
  Array.isArray(value) ? value.join(", ") : value || "";

function TemplateAction({ action, label }) {
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

function PreviewUploadButton() {
  const record = useRecordContext();
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const refresh = useRefresh();
  const inputRef = useRef(null);

  if (!record) return null;
  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={async (event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          try {
            await dataProvider.uploadTemplatePreview(record.uid, file);
            notify("Preview uploaded", { type: "info" });
            refresh();
          } catch (error) {
            notify(error.message || "Preview upload failed", { type: "warning" });
          }
        }}
      />
      <Button label="Upload preview" onClick={() => inputRef.current?.click()} />
    </>
  );
}

const TemplateActions = () => (
  <TopToolbar>
    <PreviewUploadButton />
    <TemplateAction action="publishTemplate" label="Publish" />
    <TemplateAction action="disableTemplate" label="Disable" />
  </TopToolbar>
);

const TemplateForm = () => (
  <SimpleForm>
    <TextInput source="name" required fullWidth />
    <TextInput source="slug" required fullWidth />
    <TextInput source="description" multiline fullWidth />
    <SelectInput
      source="access"
      choices={[
        { id: "free", name: "Free" },
        { id: "paid", name: "Paid" },
      ]}
      defaultValue="free"
    />
    <TextInput
      source="packageUids"
      helperText="Comma-separated package UIDs for paid templates"
      format={formatPackageUids}
      parse={parsePackageUids}
      fullWidth
    />
    <TextInput
      source="config"
      label="Template configuration JSON"
      multiline
      minRows={12}
      format={formatConfig}
      parse={parseConfig}
      required
      fullWidth
    />
    <TextInput source="version" type="number" defaultValue={1} />
    <TextInput source="sortOrder" type="number" defaultValue={0} />
  </SimpleForm>
);

export const TemplateList = () => (
  <List filters={templateFilters} sort={{ field: "sortOrder", order: "ASC" }}>
    <Datagrid rowClick="edit">
      <TextField source="name" />
      <TextField source="slug" />
      <TextField source="access" />
      <BooleanField source="published" />
      <BooleanField source="active" />
      <TextField source="previewUrl" />
      <TemplateAction action="publishTemplate" label="Publish" />
      <TemplateAction action="disableTemplate" label="Disable" />
    </Datagrid>
  </List>
);

export const TemplateCreate = () => (
  <Create>
    <TemplateForm />
  </Create>
);

export const TemplateEdit = () => (
  <Edit actions={<TemplateActions />}>
    <TemplateForm />
  </Edit>
);

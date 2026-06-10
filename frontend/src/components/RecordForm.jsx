import { useState } from "react";
import { Plus } from "lucide-react";

function initialValue(field, defaultValues) {
  if (defaultValues && defaultValues[field.name] !== undefined) {
    return defaultValues[field.name];
  }
  if (field.type === "number") return 0;
  if (field.type === "select") return field.options[0];
  if (field.type === "date") return new Date().toISOString().slice(0, 10);
  if (field.type === "datetime-local") return new Date().toISOString().slice(0, 16);
  return "";
}

function buildInitialValues(fields, defaultValues) {
  return fields.reduce((next, field) => ({ ...next, [field.name]: initialValue(field, defaultValues) }), {});
}

function normalize(fields, values) {
  return fields.reduce((payload, field) => {
    const value = values[field.name];
    payload[field.name] = field.type === "number" ? Number(value) : value;
    return payload;
  }, {});
}

export function RecordForm({ title, fields, onSubmit, defaultValues }) {
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState(() => buildInitialValues(fields, defaultValues));

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await onSubmit(normalize(fields, values));
      setExpanded(false);
    } finally {
      setSaving(false);
    }
  }

  function handleToggle() {
    setExpanded((current) => {
      if (!current) {
        setValues(buildInitialValues(fields, defaultValues));
      }
      return !current;
    });
  }

  return (
    <section className="form-panel">
      <button className="primary-action" type="button" onClick={handleToggle}>
        <Plus size={16} />
        <span>{title}</span>
      </button>
      {expanded ? (
        <form className="record-form" onSubmit={handleSubmit}>
          {fields.map((field) => (
            <label key={field.name} className={field.type === "textarea" ? "field span-2" : "field"}>
              <span>{field.label}</span>
              {field.type === "select" ? (
                <select
                  value={values[field.name]}
                  onChange={(event) => setValues({ ...values, [field.name]: event.target.value })}
                >
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : field.type === "textarea" ? (
                <textarea
                  value={values[field.name]}
                  onChange={(event) => setValues({ ...values, [field.name]: event.target.value })}
                />
              ) : (
                <input
                  type={field.type}
                  value={values[field.name]}
                  onChange={(event) => setValues({ ...values, [field.name]: event.target.value })}
                  required
                />
              )}
            </label>
          ))}
          <button className="submit-button" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </form>
      ) : null}
    </section>
  );
}

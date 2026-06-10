import { useMemo, useState } from "react";

import { DataTable } from "../components/DataTable.jsx";
import { RecordForm } from "../components/RecordForm.jsx";
import { StatusBadge } from "../components/StatusBadge.jsx";
import { useAppData } from "../context/AppContext.jsx";
import { customerFields } from "../modules/forms.js";

const STATUS_OPTIONS = ["new", "contacted", "measured", "quoted", "signed", "lost"];

const columns = [
  { key: "name", label: "Customer" },
  { key: "phone", label: "Phone" },
  { key: "community", label: "Community" },
  { key: "house_type", label: "House" },
  { key: "budget", label: "Budget", render: (row) => `CNY ${Number(row.budget).toLocaleString()}` },
  { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
  { key: "owner", label: "Owner" },
  { key: "reported_at", label: "Reported" },
];

export function CustomersPage() {
  const { customers, createRecord } = useAppData();
  const [filterStatus, setFilterStatus] = useState("");
  const [filterOwner, setFilterOwner] = useState("");

  const ownerOptions = useMemo(
    () => [...new Set(customers.map((c) => c.owner).filter((o) => o && o.trim().length > 0))].sort(),
    [customers],
  );

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      if (filterStatus && c.status !== filterStatus) return false;
      if (filterOwner && (c.owner || "") !== filterOwner) return false;
      return true;
    });
  }, [customers, filterStatus, filterOwner]);

  function clearFilters() {
    setFilterStatus("");
    setFilterOwner("");
  }

  const hasFilter = filterStatus || filterOwner;

  const formDefaults = {};
  if (filterStatus) formDefaults.status = filterStatus;
  if (filterOwner) formDefaults.owner = filterOwner;

  return (
    <div className="page-stack">
      <RecordForm
        title="Report customer"
        fields={customerFields}
        onSubmit={(payload) => createRecord("customers", payload)}
        defaultValues={hasFilter ? formDefaults : undefined}
      />
      <section className="panel">
        <div className="section-heading">
          <h2>Customer Reports</h2>
          <span>{filtered.length} records</span>
        </div>
        <div className="filter-bar">
          <label className="filter-field">
            <span>Status</span>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">All</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="filter-field">
            <span>Owner</span>
            <select value={filterOwner} onChange={(e) => setFilterOwner(e.target.value)}>
              <option value="">All</option>
              {ownerOptions.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </label>
          {hasFilter && (
            <button className="filter-clear" type="button" onClick={clearFilters}>Clear</button>
          )}
        </div>
        <DataTable columns={columns} rows={filtered} />
      </section>
    </div>
  );
}

import { useMemo, useState } from "react";
import { Undo2 } from "lucide-react";

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

function matchesFilter(customer, filterStatus, filterOwner) {
  if (filterStatus && customer.status !== filterStatus) return false;
  if (filterOwner && (customer.owner || "") !== filterOwner) return false;
  return true;
}

export function CustomersPage() {
  const { customers, createRecord, showToast } = useAppData();
  const [filterStatus, setFilterStatus] = useState("");
  const [filterOwner, setFilterOwner] = useState("");
  const [clearedFilters, setClearedFilters] = useState(null);

  const ownerOptions = useMemo(
    () => [...new Set(customers.map((c) => c.owner).filter((o) => o && o.trim().length > 0))].sort(),
    [customers],
  );

  const filtered = useMemo(() => {
    return customers.filter((c) => matchesFilter(c, filterStatus, filterOwner));
  }, [customers, filterStatus, filterOwner]);

  function clearFilters(savePrevious = false) {
    if (savePrevious && (filterStatus || filterOwner)) {
      setClearedFilters({ status: filterStatus, owner: filterOwner });
    } else {
      setClearedFilters(null);
    }
    setFilterStatus("");
    setFilterOwner("");
  }

  function restoreFilters() {
    if (clearedFilters) {
      setFilterStatus(clearedFilters.status || "");
      setFilterOwner(clearedFilters.owner || "");
      setClearedFilters(null);
    }
  }

  const hasFilter = filterStatus || filterOwner;

  const formDefaults = {};
  if (filterStatus) formDefaults.status = filterStatus;
  if (filterOwner) formDefaults.owner = filterOwner;

  async function handleCreate(payload) {
    const created = await createRecord("customers", payload);
    if (hasFilter && !matchesFilter(created, filterStatus, filterOwner)) {
      clearFilters(true);
      showToast("Customer added successfully. Filters were cleared to show the new record.", "success");
      return { skipToast: true };
    }
    return { created };
  }

  function describeFilters(filters) {
    const parts = [];
    if (filters.status) parts.push(`Status: ${filters.status}`);
    if (filters.owner) parts.push(`Owner: ${filters.owner}`);
    return parts.join(" · ");
  }

  return (
    <div className="page-stack">
      <RecordForm
        title="Report customer"
        fields={customerFields}
        onSubmit={handleCreate}
        defaultValues={hasFilter ? formDefaults : undefined}
        successMessage="Customer added successfully"
      />
      <section className="panel">
        <div className="section-heading">
          <h2>Customer Reports</h2>
          <span>{filtered.length} records</span>
        </div>
        {clearedFilters && (
          <div className="filter-restore-bar">
            <span className="filter-restore-info">
              <span className="filter-restore-label">Previous filters:</span>
              <span className="filter-restore-value">{describeFilters(clearedFilters)}</span>
            </span>
            <button className="filter-restore-btn" type="button" onClick={restoreFilters}>
              <Undo2 size={14} />
              <span>Restore</span>
            </button>
          </div>
        )}
        <div className="filter-bar">
          <label className="filter-field">
            <span>Status</span>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setClearedFilters(null);
              }}
            >
              <option value="">All</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="filter-field">
            <span>Owner</span>
            <select
              value={filterOwner}
              onChange={(e) => {
                setFilterOwner(e.target.value);
                setClearedFilters(null);
              }}
            >
              <option value="">All</option>
              {ownerOptions.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </label>
          {hasFilter && (
            <button className="filter-clear" type="button" onClick={() => clearFilters(false)}>Clear</button>
          )}
        </div>
        <DataTable columns={columns} rows={filtered} />
      </section>
    </div>
  );
}

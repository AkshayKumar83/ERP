import React, { useCallback, useState, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  Button,
  Badge,
  Input,
  Label,
  Alert,
  Spinner,
} from "reactstrap";
import { useSelector } from "react-redux";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { APP_PROD_API } from "../../../../utils/api";
import toast from "react-hot-toast";


const notificationTypes = [
  { label: "Pending PO Aging", value: "PENDING_PO", icon: "📋", color: "info" },
  { label: "Bulk Pending PO Aging", value: "PENDING_PO_VENDOR_BULK", icon: "📋", color: "info" },

  {
    label: "Loan Overdue",
    value: "LOAN_OVERDUE",
    icon: "💰",
    color: "warning",
  },
  {
    label: "Loan Statement",
    value: "LOAN_STATEMENT",
    icon: "📄",
    color: "primary",
  },
  {
    label: "Dealer Balance Statement",
    value: "DEALER_BALANCE_STATEMENT",
    icon: "📊",
    color: "success",
  },
  {
    label: "Vendor Balance Statement",
    value: "VENDOR_BALANCE_STATEMENT",
    icon: "📊",
    color: "success",
  },

{
  label: "Vendor Pending Invoice",
  value: "VENDOR_PENDING_INVOICE",
  icon: "🧾",
  color: "warning",
},

];


const StatusBadge = ({ status }) => {
  const statusConfig = {
    Ready: { color: "success", icon: "✓" },
    Missing: { color: "danger", icon: "✕" },
    Pending: { color: "warning", icon: "⏳" },
    Complete: { color: "info", icon: "✓" },
  };

  const config = statusConfig[status] || { color: "secondary", icon: "?" };

  return (
    <Badge color={config.color} className="d-flex align-items-center gap-1">
      <span>{config.icon}</span>
      {status}
    </Badge>
  );
};


const AgingBadge = ({ days }) => {
  let color = "success";
  if (days > 60) color = "danger";
  else if (days > 45) color = "warning";
  else if (days > 30) color = "info";

  return (
    <Badge color={color} pill>
      {days} days
    </Badge>
  );
};

const EmailNotifyModern = () => {
  const [filters, setFilters] = useState({
    notificationType: "PENDING_PO",
    fromDate: "",
    toDate: "",
    aging: "ALL",
    poType: "ALL",
    poStatus: "ALL",
    searchText: "",
  });

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [sending, setSending] = useState(false);

  const { user } = useSelector((state) => state.auth);

  // Advanced filtering
  const filteredRows = useMemo(() => {
    let filtered = [...rows];

    if (filters.searchText) {
      const search = filters.searchText.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.v_name?.toLowerCase().includes(search) ||
          item.po_no?.toLowerCase().includes(search) ||
          item.dealer_name?.toLowerCase().includes(search) ||
          item.dealer_code?.toLowerCase().includes(search) ||
          item.member_no?.toLowerCase().includes(search) ||
          item.loan_no?.toLowerCase().includes(search),
      );
    }

    return filtered;
  }, [rows, filters.searchText]);

  // Sorting
  const sortedRows = useMemo(() => {
    if (!sortConfig.key) return filteredRows;

    const sorted = [...filteredRows].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === null) return 1;
      if (bValue === null) return -1;

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;

      return 0;
    });

    return sorted;
  }, [filteredRows, sortConfig]);


  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "notificationType") {
      handleNotificationTypeChange(value);
      return;
    }

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNotificationTypeChange = (type) => {
    setFilters({
      notificationType: type,
      fromDate: "",
      toDate: "",
      aging: "ALL",
      poType: "ALL",
      poStatus: "ALL",
      searchText: "",
    });

    setRows([]);
    setSelectedRows(new Set());
    setSortConfig({ key: null, direction: "asc" });
  };

  const fetchRecords = async () => {
   if (
  ["DEALER_BALANCE_STATEMENT", "VENDOR_BALANCE_STATEMENT"].includes(
    filters.notificationType
  ) &&
  (!filters.fromDate || !filters.toDate)
) {
  toast.error("Please select both From Date and To Date.");
  return;
}

    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.EMAIL_NOTIFICATION_FETCH}?division=${user?.global_division_id}&trans_year=${user?.global_fin_year}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(filters),
          credentials: "include",
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error(result.message);
        return;
      }

      const data = result.data.map((item, index) => ({
        id: index + 1,
        ...item,
        status: item.email ? "Ready" : "Missing",
      }));

      setRows(data);
      setSelectedRows(new Set());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRow = (id) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const toggleAll = () => {
    if (selectedRows.size === sortedRows.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(sortedRows.map((item) => item.id)));
    }
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleSendEmail = async () => {
    const selected = sortedRows.filter((row) => selectedRows.has(row.id));

    if (selected.length === 0) {
      toast.error("Please select at least one record.");
      return;
    }

    setSending(true);

    try {
      const [response] = await Promise.all([
        fetch(
          `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.EMAIL_NOTIFICATION_SEND}?user_id=${user?.id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              notificationType: filters.notificationType,
               fromDate: filters.fromDate,
                toDate: filters.toDate,
                 aging: filters.aging, // I ADDED FOR PENDING_PO_BULK
                 poType: filters.poType, // I ADDED FOR PENDING_PO_BULK
                division: user?.global_division_id,
                transYear: user?.global_fin_year,
                records: selected,
            }),
          },
        ),
        delay(2000),
      ]);

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error("Unable to send emails.");
    } finally {
      setSending(false);
    }
  };

  const stats = useMemo(
    () => ({
      total: rows.length,
      ready: rows.filter((x) => x.status === "Ready").length,
      missing: rows.filter((x) => x.status === "Missing").length,
      selected: selectedRows.size,
    }),
    [rows, selectedRows],
  );

  const currentNotification = notificationTypes.find(
    (nt) => nt.value === filters.notificationType,
  );

  const resetForm = () => {
    setFilters({
      notificationType: "PENDING_PO",
      fromDate: "",
      toDate: "",
      aging: "ALL",
      poType: "ALL",
      poStatus: "ALL",
      searchText: "",
    });

    setRows([]);
    setSelectedRows(new Set());
    setSortConfig({ key: null, direction: "asc" });
  };

  const tableConfig = {

    PENDING_PO: {
      columns: [
        {
          key: "v_name",
          label: "Vendor",
          render: (item) => (
            <>
              <strong>{item.v_name}</strong>
              {item.dealer_name && (
                <div>
                  <small className="text-muted">{item.dealer_name}</small>
                </div>
              )}
            </>
          ),
        },
        {
          key: "po_no",
          label: "PO No",
        },
        {
          key: "po_dt",
          label: "PO Date",
          render: (item) => new Date(item.po_dt).toLocaleDateString(),
        },
        {
          key: "aging",
          label: "Aging",
          render: (item) => <AgingBadge days={item.aging || 0} />,
        },
        {
          key: "email",
          label: "Email",
        },
        {
          key: "last_email_sent_on",
          label: "Last Sent",
        },
        {
          key: "status",
          label: "Status",
          render: (item) => <StatusBadge status={item.status} />,
        },
      ],
    },

    PENDING_PO_VENDOR_BULK: {
  columns: [
    {
      key: "v_code",
      label: "Vendor Code",
    },
    {
      key: "v_name",
      label: "Vendor",
      render: (item) => (
        <strong>{item.v_name}</strong>
      ),
    },
    {
      key: "pending_count",
      label: "Pending PO/PA",
      render: (item) => (
        <Badge color="info" pill>
          {item.pending_count}
        </Badge>
      ),
    },
    {
      key: "email",
      label: "Email",
    },
    {
      key: "last_email_sent_on",
      label: "Last Sent",
    },
    {
      key: "status",
      label: "Status",
      render: (item) => (
        <StatusBadge status={item.status} />
      ),
    },
  ],
    },

    LOAN_STATEMENT: {
      columns: [
        {
          key: "dealer_code",
          label: "Dealer Code",
        },
        {
          key: "member_no",
          label: "Member No",
        },
        {
          key: "dealer_name",
          label: "Dealer Name",
        },
        {
          key: "loan_no",
          label: "Loan No",
        },
        {
          key: "loan_date",
          label: "EMFA Application Date",
        },
        {
          key: "loan_type",
          label: "EMFA Type",
        },
        {
          key: "loan_amt",
          label: "Loan Amount",
        },
        {
          key: "email",
          label: "Email",
        },
        {
          key: "alternate_email",
          label: "Alternate Email",
        },
        {
          key: "last_email_sent_on",
          label: "Last Sent",
        },
        {
          key: "status",
          label: "Status",
          render: (item) => <StatusBadge status={item.status} />,
        },
      ],
    },

    DEALER_BALANCE_STATEMENT: {
      columns: [
        {
          key: "dealer_code",
          label: "Dealer Code",
        },
        {
          key: "member_no",
          label: "Member No",
        },
        {
          key: "dealer_name",
          label: "Dealer Name",
        },
        {
          key: "dlr_type",
          label: "Dealer Type",
        },
        {
          key: "city",
          label: "City",
        },
        {
          key: "email",
          label: "Email",
        },
        {
          key: "alternate_email",
          label: "Alternate Email",
        },
        {
          key: "last_email_sent_on",
          label: "Last Sent",
        },
        {
          key: "status",
          label: "Status",
          render: (item) => <StatusBadge status={item.status} />,
        },
      ],
    },

    VENDOR_BALANCE_STATEMENT: {
      columns: [
        {
          key: "v_code",
          label: "Vendor Code",
        },
  
        {
          key: "v_name",
          label: "Vendor Name",
        },
        // {
        //   key: "dlr_type",
        //   label: "Dealer Type",
        // },
        {
          key: "v_city_name",
          label: "City",
        },
        {
          key: "gst_no",
          label: "GST",
        },
        {
          key: "pan_no",
          label: "PAN",
        },
        {
          key: "email",
          label: "Email",
        },
      
   
        {
          key: "last_email_sent_on",
          label: "Last Sent",
        },
        {
          key: "status",
          label: "Status",
          render: (item) => <StatusBadge status={item.status} />,
        },
      ],
    },

    LOAN_OVERDUE: {
      columns: [
        {
          key: "dealer_code",
          label: "Dealer Code",
        },
        {
          key: "member_no",
          label: "Member No",
        },
        {
          key: "dealer_name",
          label: "Dealer Name",
        },
        {
          key: "city",
          label: "City",
        },
        {
          key: "total_loans",
          label: "Pending Loans",
          render: (item) => <span className="fw-bold">{item.total_loans}</span>,
        },
        {
          key: "total_pending_amount",
          label: "Pending Amount",
          render: (item) => (
            <span className="text-danger fw-bold">
              {Number(item.total_pending_amount).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </span>
          ),
        },
        {
          key: "email",
          label: "Email",
        },
        {
          key: "alternate_email",
          label: "Alternate Email",
        },
        {
          key: "last_email_sent_on",
          label: "Last Sent",
        },
        {
          key: "status",
          label: "Status",
          render: (item) => <StatusBadge status={item.status} />,
        },
      ],
    },

    VENDOR_PENDING_INVOICE: {
      columns: [
        {
          key: "v_code",
          label: "Vendor Code",
        },
        {
          key: "v_name",
          label: "Vendor Name",
        },
        {
          key: "v_city_name",
          label: "City",
        },
        {
          key: "gst_no",
          label: "GST",
        },
        {
          key: "pan_no",
          label: "PAN",
        },
        {
          key: "email",
          label: "Email",
        },
        {
          key: "last_email_sent_on",
          label: "Last Sent",
        },
        {
          key: "status",
          label: "Status",
          render: (item) => (
            <StatusBadge status={item.status} />
          ),
        },
      ],
    },

  };

  const currentColumns = tableConfig[filters.notificationType]?.columns || [];

  return (
    <Container fluid className="py-3 px-2 px-md-4">
      {/* Header */}
      {/* <Row className="mb-3">
        <Col>
          <div className="d-flex align-items-center gap-2">
            <div style={{ fontSize: "1.8rem" }}>
              {currentNotification?.icon}
            </div>
            <div>
              <h5 className="mb-0">Email Notification Center</h5>
              <small className="text-muted">
                Manage and send bulk notifications
              </small>
            </div>
          </div>
        </Col>
      </Row> */}

      {/* Notification Type Selector - Horizontal Scroll */}
      <Row className="mb-3">
        <Col>
          <div style={{ overflowX: "auto", paddingBottom: "0.5rem" }}>
            <div className="d-flex gap-2" style={{ minWidth: "min-content" }}>
              {notificationTypes.map((type) => (
                <Card
                  key={type.value}
                  style={{
                    cursor: "pointer",
                    border:
                      filters.notificationType === type.value
                        ? "2px solid #0d6efd"
                        : "1px solid #dee2e6",
                    backgroundColor:
                      filters.notificationType === type.value
                        ? "#f0f7ff"
                        : "white",
                    minWidth: "140px",
                    flex: "0 0 auto",
                  }}
                  // onClick={() =>
                  //   setFilters((prev) => ({
                  //     ...prev,
                  //     notificationType: type.value,
                  //   }))
                  // }
                  onClick={() => handleNotificationTypeChange(type.value)}
                >
                  <CardBody className="text-center p-2">
                    <div style={{ fontSize: "1.2rem" }} className="mb-1">
                      {type.icon}
                    </div>
                    <h6 className="mb-0" style={{ fontSize: "0.75rem" }}>
                      {type.label}
                    </h6>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        </Col>
      </Row>

      {/* Filter Card */}
      <Card className="mb-3 shadow-sm">
        <CardHeader className="bg-light border-bottom">
          <h6 className="mb-0">Filters</h6>
        </CardHeader>
        <CardBody className="p-2">
          <Row className="g-2">
            <Col xs={12} sm={6} md={3} lg={2}>
              <Label className="small fw-600 mb-1">Notification Type</Label>
              <Input
                type="select"
                name="notificationType"
                value={filters.notificationType}
                onChange={handleChange}
                size="sm"
                style={{ fontSize: "0.875rem" }}
              >
                {notificationTypes.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </Input>
            </Col>

           {/**  {filters.notificationType === "PENDING_PO" && (***/} 
            {["PENDING_PO", "PENDING_PO_VENDOR_BULK"].includes(
               filters.notificationType
                ) && (
              <>
                <Col xs={12} sm={6} md={3} lg={2}>
                  <Label className="small fw-600 mb-1">PO Type</Label>
                  <Input
                    type="select"
                    name="poType"
                    value={filters.poType}
                    onChange={handleChange}
                    size="sm"
                    style={{ fontSize: "0.875rem" }}
                  >
                    <option value="ALL">All Types</option>
                    <option value="O">Purchase Order</option>
                    <option value="A">Purchase Advice</option>
                  </Input>
                </Col>

                <Col xs={12} sm={6} md={3} lg={2}>
                  <Label className="small fw-600 mb-1">PO Status</Label>
                  <Input
                    type="select"
                    name="poStatus"
                    value={filters.poStatus}
                    onChange={handleChange}
                    size="sm"
                    style={{ fontSize: "0.875rem" }}
                  >
                    <option value="ALL">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="COMPLETE">Complete</option>
                  </Input>
                </Col>

                <Col xs={12} sm={6} md={3} lg={2}>
                  <Label className="small fw-600 mb-1">Aging</Label>
                  <Input
                    type="select"
                    name="aging"
                    value={filters.aging}
                    onChange={handleChange}
                    size="sm"
                    style={{ fontSize: "0.875rem" }}
                  >
                    <option value="ALL">All Ages</option>
                    <option value="0_7">0 - 7 Days</option>
                    <option value="8_15">8 - 15 Days</option>
                    <option value="16_30">16 - 30 Days</option>
                    <option value="31_45">31 - 45 Days</option>
                    <option value="46_60">46 - 60 Days</option>
                    <option value="60_PLUS">Above 60 Days</option>
                  </Input>
                </Col>
              </>
            )}

            <Col xs={12} sm={6} md={3} lg={2}>
              <Label className="small fw-600 mb-1">From Date</Label>
              <Input
                type="date"
                name="fromDate"
                value={filters.fromDate}
                onChange={handleChange}
                size="sm"
                style={{ fontSize: "0.875rem" }}
              />
            </Col>

            <Col xs={12} sm={6} md={3} lg={2}>
              <Label className="small fw-600 mb-1">To Date</Label>
              <Input
                type="date"
                name="toDate"
                value={filters.toDate}
                onChange={handleChange}
                size="sm"
                style={{ fontSize: "0.875rem" }}
              />
            </Col>

            <Col xs={12} sm={6} md={3} lg={2}>
              <Label className="small fw-600 mb-1">Search</Label>
              <Input
                type="text"
                name="searchText"
                placeholder="Vendor, PO..."
                value={filters.searchText}
                onChange={handleChange}
                size="sm"
                style={{ fontSize: "0.875rem" }}
              />
            </Col>

            <Col xs={12} md={3} lg={2} className="d-flex align-items-end">
              <Button
                color="primary"
                onClick={fetchRecords}
                disabled={loading}
                className="w-100"
                size="sm"
                style={{ fontSize: "0.875rem" }}
              >
                {loading && <Spinner size="sm" className="me-1" />}
                {loading ? "Loading..." : "Fetch"}
              </Button>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Stats Row */}
      {rows.length > 0 && (
        <Row className="mb-3 g-2">
          <Col xs={6} sm={3}>
            <Card className="text-center bg-light border-0">
              <CardBody className="p-2">
                <h6 className="text-primary mb-0">{stats.total}</h6>
                <small className="text-muted">Total</small>
              </CardBody>
            </Card>
          </Col>
          <Col xs={6} sm={3}>
            <Card className="text-center bg-light border-0">
              <CardBody className="p-2">
                <h6 className="text-success mb-0">{stats.ready}</h6>
                <small className="text-muted">Ready</small>
              </CardBody>
            </Card>
          </Col>
          <Col xs={6} sm={3}>
            <Card className="text-center bg-light border-0">
              <CardBody className="p-2">
                <h6 className="text-danger mb-0">{stats.missing}</h6>
                <small className="text-muted">Missing</small>
              </CardBody>
            </Card>
          </Col>
          <Col xs={6} sm={3}>
            <Card className="text-center bg-light border-0">
              <CardBody className="p-2">
                <h6 className="text-warning mb-0">{stats.selected}</h6>
                <small className="text-muted">Selected</small>
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}

      {/* Data Table Container with Scrolling */}
      {loading && (
        <Alert color="info" className="text-center py-3 mb-3">
          <Spinner size="sm" className="me-2" />
          Loading records...
        </Alert>
      )}

      {!loading && sortedRows.length > 0 && (
        <>
          <Card className="shadow-sm mb-3">
            <CardHeader className="bg-light d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Records ({sortedRows.length})</h6>
              {selectedRows.size > 0 && (
                <Badge color="primary" style={{ fontSize: "0.75rem" }}>
                  {selectedRows.size} selected
                </Badge>
              )}
            </CardHeader>
            <CardBody className="p-0">
              <div
                style={{
                  overflowX: "auto",
                  overflowY: "auto",
                  maxHeight: "500px",
                }}
              >
                <table
                  className="table table-hover mb-0"
                  style={{ fontSize: "0.875rem" }}
                >
                  <thead className="table-light sticky-top">
                    <tr>
                      <th style={{ width: "40px", minWidth: "40px" }}>
                        <Input
                          type="checkbox"
                          checked={
                            selectedRows.size === sortedRows.length &&
                            sortedRows.length > 0
                          }
                          onChange={toggleAll}
                          style={{ cursor: "pointer" }}
                        />
                      </th>

                      {currentColumns.map((col) => (
                        <th
                          key={col.key}
                          onClick={() => handleSort(col.key)}
                          style={{
                            cursor: "pointer",
                            userSelect: "none",
                            minWidth: "100px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {col.label}
                          {sortConfig.key === col.key &&
                            (sortConfig.direction === "asc" ? " ↑" : " ↓")}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {sortedRows.map((item) => (
                      <tr
                        key={item.id}
                        style={{
                          backgroundColor: selectedRows.has(item.id)
                            ? "#f0f7ff"
                            : "white",
                          opacity: item.status === "Missing" ? 0.6 : 1,
                        }}
                      >
                        <td style={{ width: "40px", minWidth: "40px" }}>
                          <Input
                            type="checkbox"
                            checked={selectedRows.has(item.id)}
                            disabled={item.status === "Missing"}
                            onChange={() => toggleRow(item.id)}
                            style={{ cursor: "pointer" }}
                          />
                        </td>

                        {currentColumns.map((col) => (
                          <td key={col.key}>
                            <div style={{ minWidth: "100px" }}>
                              {col.render ? col.render(item) : item[col.key]}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>

          {/* Send Email Button - Below Table */}
          <Row className="mb-4">
            <Col className="d-flex gap-2 justify-content-end">
              <Button
                color="secondary"
                outline
                size="sm"
                onClick={() => {
                  setFilters({
                    notificationType: "PENDING_PO",
                    fromDate: "",
                    toDate: "",
                    aging: "ALL",
                    poType: "ALL",
                    poStatus: "ALL",
                    searchText: "",
                  });
                  setRows([]);
                  setSelectedRows(new Set());
                }}
                style={{ fontSize: "0.875rem" }}
              >
                Reset
              </Button>

              <Button
                color="success"
                size="sm"
                onClick={handleSendEmail}
                disabled={selectedRows.size === 0 || sending}
                style={{ fontSize: "0.875rem" }}
              >
                {sending ? (
                  <>
                    <Spinner size="sm" className="me-1" />
                    Sending...
                  </>
                ) : (
                  <>Send Email ({selectedRows.size})</>
                )}
              </Button>
            </Col>
          </Row>
        </>
      )}

      {!loading && sortedRows.length === 0 && rows.length === 0 && (
        <Alert color="info" className="text-center py-4 mb-0">
          <h6>No records found</h6>
          <small>
            Click "Fetch Records" to load data based on your filters
          </small>
        </Alert>
      )}

      {!loading && sortedRows.length === 0 && rows.length > 0 && (
        <Alert color="warning" className="text-center py-4 mb-0">
          <h6>No matching records</h6>
          <small>Try adjusting your search filters</small>
        </Alert>
      )}
    </Container>
  );
};

export default EmailNotifyModern;

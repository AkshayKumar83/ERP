import React, { useState, useEffect } from "react";
import { TabContent, TabPane, Row, Col, Form } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import TextField from "../../../../components/basic/textField";
import Select from "../../../../components/basic/select";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { APP_PROD_API } from "../../../../utils/api";


const BalanceSheetForm = () => {

  const { user, finYearList, divisionList } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState(1);
  
  // Form fields
  const [formData, setFormData] = useState({
    finyear: "",
    curryear: "",
    trial_range: true,
    range_date: "",
    allvouch: "N",
    inc_op_bal: "Y",
    memo: "N",
    zero_bal: "N",
    rg_bs_pl: "B", // Balance Sheet default
    dest_type: "",
    divisions: [], // {division_id, name, selected}
  });

  const tabs = ["Balance Sheet / Profit & Loss"];

  // Initialize finyear, divisions
  
  useEffect(() => {
    if (finYearList?.length > 0) {
      const defaultYear = finYearList[0].year_code;
      setFormData((prev) => ({
        ...prev,
        finyear: defaultYear,
        curryear: defaultYear,
      }));

      // Set range_date to current date (as per Oracle logic)
      const today = new Date().toISOString().slice(0, 10);
      setFormData((prev) => ({ ...prev, range_date: today }));
    }

    if (divisionList?.length > 0) {
      const divs = divisionList.map((d) => ({
        division_id: d.division_id,
        name: d.name,
        selected: false,
      }));
      setFormData((prev) => ({ ...prev, divisions: divs }));
    }
  }, [finYearList, divisionList]);

  // Change handler
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    let finalValue = value;

    if (type === "checkbox") {
      finalValue = checked ? "Y" : "N";
    }

    setFormData((prev) => ({ ...prev, [name]: finalValue }));
  };

  // Handle trial_range toggle
  useEffect(() => {
    if (!formData.trial_range) {
      const today = new Date().toISOString().slice(0, 10);
      setFormData((prev) => ({ ...prev, range_date: today }));
    }
  }, [formData.trial_range]);

  // Division toggle
  const toggleDivision = (idx) => {
    const updated = [...formData.divisions];
    updated[idx].selected = !updated[idx].selected;
    setFormData((prev) => ({ ...prev, divisions: updated }));
  };

  const setAllDiv = (bool) => {
    const updated = formData.divisions.map((d) => ({ ...d, selected: bool }));
    setFormData((prev) => ({ ...prev, divisions: updated }));
  };

  const invertDiv = () => {
    const updated = formData.divisions.map((d) => ({
      ...d,
      selected: !d.selected,
    }));
    setFormData((prev) => ({ ...prev, divisions: updated }));
  };

  // Report Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const selectedDivIds = formData.divisions
      .filter((d) => d.selected)
      .map((d) => d.division_id);

    // Oracle logic: If none selected → treat as ALL
    const finalDivisionIds =
      selectedDivIds.length === 0 ? [999] : selectedDivIds;

    try {
      const payload = {
        P_DIVISION_IDS: finalDivisionIds,
        P_TRANS_YEAR: formData.curryear,
        P_AS_ON_DATE: formData.range_date,
        P_ZERO_BAL: formData.zero_bal,
        P_BS_PL_FLAG: formData.rg_bs_pl,
        P_INCLUDE_MEMO: formData.memo,
        P_INCLUDE_UNPOSTED: formData.allvouch,
        P_INCLUDE_OPENING_BAL: formData.inc_op_bal,
        P_DEST_TYPE: formData.dest_type,
        P_USER_ID: user?.global_user_id,
      };

      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GENERATE_BALANCE_SHEET}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (response.ok && result.reportUrl) {
        window.open(result.reportUrl, "_blank");
      } else {
        toast.error(result?.message || "Report generation failed!");
      }
    } catch (err) {
      toast.error("Error generating report!");
      console.error(err);
    }
  };

  return (
    <FormSetup
      navType="tabs"
      activeTab={activeTab}
      tabs={tabs}
      updateActiveTab={(t) => setActiveTab(t)}
      isSingleQuery={true}
      formStatus="" // no Insert/Update
      handleSubmit={handleSubmit}
      handleCancel={() => {}}
      formName={"Balance Sheet / Profit & Loss"}
      authority={{ insert: "N", update: "N" }}
    >
      <TabContent activeTab={activeTab}>
        <TabPane tabId={1}>
          <div className="p-4 bg-white shadow rounded" style={{ maxWidth: "900px", margin: "0 auto" }}>
            <Form>
              {/* FIN YEAR */}
              <Row>
                <Col xl={3}>
                  <Select
                    label="Financial Year"
                    name="finyear"
                    value={formData.finyear}
                    onChange={handleChange}
                    options={
                      finYearList?.map((y) => ({
                        value: y.year_code,
                        label: y.fin_year,
                      })) || []
                    }
                  />
                </Col>

                <Col xl={3}>
                  <TextField
                    label="Curr Year"
                    name="curryear"
                    value={formData.curryear}
                    display
                  />
                </Col>

                <Col xl={3}>
                  <label className="form-check-label">Last Result</label>
                  <input
                    type="checkbox"
                    name="trial_range"
                    checked={formData.trial_range}
                    onChange={(e) =>
                      setFormData({ ...formData, trial_range: e.target.checked })
                    }
                  />
                </Col>

                <Col xl={3}>
                  <TextField
                    label="As On Date"
                    type="date"
                    name="range_date"
                    value={formData.range_date}
                    onChange={handleChange}
                    disabled={!formData.trial_range}
                  />
                </Col>
              </Row>

              {/* CHECKBOXES */}
              <Row className="mt-3">
                <Col xl={3}>
                  <label>
                    <input
                      type="checkbox"
                      name="allvouch"
                      checked={formData.allvouch === "Y"}
                      onChange={handleChange}
                    />
                    &nbsp;Include UnPosted Vouchers
                  </label>
                </Col>

                <Col xl={3}>
                  <label>
                    <input
                      type="checkbox"
                      name="inc_op_bal"
                      checked={formData.inc_op_bal === "Y"}
                      onChange={handleChange}
                    />
                    &nbsp;Include Opening Balances
                  </label>
                </Col>

                <Col xl={3}>
                  <label>
                    <input
                      type="checkbox"
                      name="memo"
                      checked={formData.memo === "Y"}
                      onChange={handleChange}
                    />
                    &nbsp;Include Memo Vouchers
                  </label>
                </Col>

                <Col xl={3}>
                  <label>
                    <input
                      type="checkbox"
                      name="zero_bal"
                      checked={formData.zero_bal === "Y"}
                      onChange={handleChange}
                    />
                    &nbsp;With Zero Balance
                  </label>
                </Col>
              </Row>

              {/* RADIO: Report Type */}
              <Row className="mt-3">
                <Col xl={12}>
                  <label><b>Report Type</b></label>
                  <div className="d-flex gap-4 mt-1">
                    {[
                      { val: "B", lbl: "Balance Sheet" },
                      { val: "P", lbl: "Profit & Loss" },
                      { val: "PS", lbl: "P&L Schedule" },
                      { val: "BS", lbl: "B/S Schedule" },
                      { val: "BU", lbl: "B/S Sub Schd" },
                      { val: "PU", lbl: "P&L Sub Schd" },
                    ].map((r) => (
                      <label key={r.val}>
                        <input
                          type="radio"
                          name="rg_bs_pl"
                          checked={formData.rg_bs_pl === r.val}
                          onChange={() =>
                            setFormData((p) => ({ ...p, rg_bs_pl: r.val }))
                          }
                        />
                        &nbsp;{r.lbl}
                      </label>
                    ))}
                  </div>
                </Col>
              </Row>

              {/* DESTINATION TYPE */}
              <Row className="mt-3">
                <Col xl={3}>
                  <Select
                    label="Destination"
                    name="dest_type"
                    value={formData.dest_type}
                    onChange={handleChange}
                    options={[
                      { value: "", label: "" },
                      { value: "SCREEN", label: "Screen" },
                      { value: "PDF", label: "PDF" },
                      { value: "PRINTER", label: "Printer" },
                    ]}
                  />
                </Col>
              </Row>

              {/* DIVISIONS TABLE */}
              <Row className="mt-4">
                <Col xl={12}>
                  <div className="d-flex gap-2 mb-2">
                    <button type="button" className="btn btn-sm btn-secondary" onClick={() => setAllDiv(true)}>
                      All
                    </button>
                    <button type="button" className="btn btn-sm btn-secondary" onClick={() => setAllDiv(false)}>
                      None
                    </button>
                    <button type="button" className="btn btn-sm btn-secondary" onClick={invertDiv}>
                      Invert
                    </button>
                  </div>

                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Select</th>
                        <th>Division ID</th>
                        <th>Division Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.divisions.map((d, idx) => (
                        <tr key={d.division_id}>
                          <td style={{ textAlign: "center" }}>
                            <input
                              type="checkbox"
                              checked={d.selected}
                              onChange={() => toggleDivision(idx)}
                            />
                          </td>
                          <td>{d.division_id}</td>
                          <td>{d.name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Col>
              </Row>
            </Form>
          </div>
        </TabPane>
      </TabContent>
    </FormSetup>
  );
};

export default BalanceSheetForm;

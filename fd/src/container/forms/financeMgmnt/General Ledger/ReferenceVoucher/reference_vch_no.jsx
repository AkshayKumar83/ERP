import React, { useEffect } from "react";

import {
  Modal,
  ModalBody,
  ModalHeader,
  TabContent,
  TabPane,
  Row,
  Col,
  Form,
  Table,
  Card,
} from "reactstrap";
import { useFormStatus } from "../../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import ButtonUi from "../../../../../components/basic/button";
//import Select from "../../../../components/basic/select";
import TextField from "../../../../../components/basic/textField";
import toast from "react-hot-toast";

const ReferenceVoucher = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toggleModal = () => setIsModalOpen(!isModalOpen);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsModalOpen(true);
  }, []);

  const [formData, setFormData] = useState({});
  const { formStatus } = useFormStatus();

  const handleChange = useCallback((name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  //console.log("formStatus from memberform", formStatus);

  // ON CLICK IN PRINT BUTTON, EXPENSE REPORT WILL BE CALLED USING JASPER JAVA SERVICE
  const getExpVchReport = async (e, expVchData) => {
    e.preventDefault();
    const { voucher_no } = expVchData;
    const division_id = 1;
    const trans_year = "2023";

    if (!voucher_no) {
      toast.error("Voucher No is required for the report!");
      return;
    }

    setIsLoading(true); // Start loader
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}/generate-report/exp_vch`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pVch_no: voucher_no,
            P_TRANS_YEAR: trans_year,
            P_DIVISION_ID: division_id,
          }),
          credentials:'include',
        }
      );

      if (!response.ok) {
        throw new Error("Report generation failed!");
      }

      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "expense_report.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setFormData({});
    } catch (err) {
      console.error(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false); // Stop loader
    }
  };

  return (
    <Modal isOpen={isModalOpen} toggle={toggleModal} size="lg">
      <ModalHeader toggle={toggleModal}></ModalHeader>
      <ModalBody>
        <Form
          id={"change-fin-year-form"}
          onSubmit={(e) => getExpVchReport(e, formData)}
        >
          <Row>
            <Col xl={7} className="m-auto">
              <Card className="mb-2 p-3 mt-2">
                <div className="d-flex justify-content-center box-border mb-2 shadow-sm">
                  <h2
                    style={{
                      fontSize: "28px",
                      textAlign: "center",
                    }}
                  >
                    Reference Voucher Printing
                  </h2>
                </div>
                <Row className="mt-3">
                  <Col xl={12} className="m-auto ">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "15px",
                        width: "100%",
                      }}
                    >
                      <label
                        style={{
                          width: "20%",
                          textAlign: "right",
                          fontWeight: "bold",
                          fontSize: "13px",
                        }}
                      >
                        Voucher No
                      </label>
                      <div style={{ width: "80%" }}>
                        <TextField
                          name="voucher_no"
                          value={formData.voucher_no || ""}
                          onChange={(e) =>
                            handleChange("voucher_no", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </Col>
                </Row>

                <Row className="mt-4">
                  <div
                    style={{
                      display: "flex",
                      gap: "16px",
                      justifyContent: "center",
                    }}
                  >
                    <ButtonUi
                      type="submit"
                      color="secondary"
                      className="px-3"
                      disabled={isLoading}
                    >
                      {isLoading ? "Processing..." : "OK"}
                    </ButtonUi>
                    <ButtonUi color="secondary" onClick={toggleModal}>
                      Cancel
                    </ButtonUi>
                  </div>
                </Row>
              </Card>
            </Col>
          </Row>
        </Form>
      </ModalBody>
    </Modal>
  );
};

export default ReferenceVoucher;

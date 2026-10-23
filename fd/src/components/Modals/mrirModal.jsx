import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Table } from "reactstrap";
import ButtonUi from "../basic/button";

const MRIRModal = ({ isOpen, onClose, data = [] }) => {
  return (
    <Modal isOpen={isOpen} toggle={onClose} centered>
      <ModalHeader toggle={onClose}>MRIR Details</ModalHeader>

      <ModalBody>
        <div style={{ maxHeight: "300px", overflowY: "auto" }}>
          <Table bordered>
            <thead>
              <tr>
                <th>MRIR Number</th>
                <th>MRIR Date</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((item, index) => (
                  <tr key={index}>
                    <td>{item.mrirNo}</td>
                    <td>{item.mrirDate}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="text-center">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </ModalBody>

      <ModalFooter>
        <ButtonUi color="secondary" outline onClick={onClose} type="button">
          Return
        </ButtonUi>
      </ModalFooter>
    </Modal>
  );
};

export default MRIRModal;

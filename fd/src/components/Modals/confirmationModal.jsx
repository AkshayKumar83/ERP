import React from "react";
import PropTypes from "prop-types";
import { Modal, ModalHeader, ModalBody, ModalFooter, Table } from "reactstrap";
import ButtonUi from "../basic/button";

const ConfirmationModal = ({
  isOpen,
  onClose,
  title = "",
  description = "",
  onSuccess = () => {},
  showConfirm = true,
}) => {
  return (
    <Modal isOpen={isOpen} toggle={onClose} centered>
      <ModalHeader toggle={onClose}>{title}</ModalHeader>
      <ModalBody>{description}</ModalBody>
      <ModalFooter>
        <ButtonUi color="secondary" outline onClick={onClose} type="button">
          Cancel
        </ButtonUi>
        {showConfirm && (
          <ButtonUi color="primary" outline onClick={onSuccess} type="button">
            Confirm
          </ButtonUi>
        )}
      </ModalFooter>
    </Modal>
  );
};
ConfirmationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  description: PropTypes.string,
  onSuccess: PropTypes.func,
  showConfirm: PropTypes.bool,
};

export default ConfirmationModal;

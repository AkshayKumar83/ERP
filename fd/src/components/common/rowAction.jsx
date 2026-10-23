// import React from "react";

// const RowAction = ({
//   formStatus = "",
//   formData = [{}],
//   handleDelete,
//   data,
//   rowIndex,
//   handleUpdate,
// }) => {
//   return (
//     <>
//       {formData?.length >= 1 && formStatus === "Update" ? (
//         <div className="action-on-update">
//           <button
//             type="button"
//             onClick={() => handleDelete(data, rowIndex)}
//             className="action-delete"
//           >
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               viewBox="0 0 448 512"
//               width="16"
//               height="16"
//             >
//               <path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0L284.2 0c12.1 0 23.2 6.8 28.6 17.7L320 32l96 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 96C14.3 96 0 81.7 0 64S14.3 32 32 32l96 0 7.2-14.3zM32 128l384 0 0 320c0 35.3-28.7 64-64 64L96 512c-35.3 0-64-28.7-64-64l0-320zm96 64c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16z" />
//             </svg>
//           </button>
//           <div className="vertical-line"></div>
//           <button
//             type="button"
//             onClick={() => handleUpdate(data)}
//             className="action-update"
//           >
//             <svg
//               id="Layer_1"
//               data-name="Layer 1"
//               xmlns="http://www.w3.org/2000/svg"
//               viewBox="0 0 122.61 122.88"
//               width="16"
//               height="16"
//             >
//               <path d="M111.9,61.57a5.36,5.36,0,0,1,10.71,0A61.3,61.3,0,0,1,17.54,104.48v12.35a5.36,5.36,0,0,1-10.72,0V89.31A5.36,5.36,0,0,1,12.18,84H40a5.36,5.36,0,1,1,0,10.71H23a50.6,50.6,0,0,0,88.87-33.1ZM106.6,5.36a5.36,5.36,0,1,1,10.71,0V33.14A5.36,5.36,0,0,1,112,38.49H84.44a5.36,5.36,0,1,1,0-10.71H99A50.6,50.6,0,0,0,10.71,61.57,5.36,5.36,0,1,1,0,61.57,61.31,61.31,0,0,1,91.07,8,61.83,61.83,0,0,1,106.6,20.27V5.36Z" />
//             </svg>
//           </button>
//         </div>
//       ) : formData?.length > 1 && formStatus === "Insert" ? (
//         <button
//           // onClick={() => handleDeleteRow(rowIndex)}
//           type="button"
//           onClick={() => handleDelete(data, rowIndex)}
//           className="delete__row__button"
//         >
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             viewBox="0 0 448 512"
//             width="16"
//             height="16"
//           >
//             <path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0L284.2 0c12.1 0 23.2 6.8 28.6 17.7L320 32l96 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 96C14.3 96 0 81.7 0 64S14.3 32 32 32l96 0 7.2-14.3zM32 128l384 0 0 320c0 35.3-28.7 64-64 64L96 512c-35.3 0-64-28.7-64-64l0-320zm96 64c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16z" />
//           </svg>
//         </button>
//       ) : (
//         " - "
//       )}
//     </>
//   );
// };

// export default RowAction;



// import  React from "react"
// import { useState } from "react"
// import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap"
// // import "./RowAction.scss"


// const RowAction = ({ formStatus, canDelete, onDelete, onUpdate }) => {
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

//   const toggleDeleteModal = () => setIsDeleteModalOpen(!isDeleteModalOpen)

//   const handleDelete = () => {
//     onDelete()
//     toggleDeleteModal()
//   }

//   if (formStatus === "Update") {
//     return (
//       <div className="row-action">
//         {canDelete && (
//           <Button color="link" className="action-button delete-button" onClick={toggleDeleteModal}>
//             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="16" height="16">
//               <path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0L284.2 0c12.1 0 23.2 6.8 28.6 17.7L320 32l96 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 96C14.3 96 0 81.7 0 64S14.3 32 32 32l96 0 7.2-14.3zM32 128l384 0 0 320c0 35.3-28.7 64-64 64L96 512c-35.3 0-64-28.7-64-64l0-320zm96 64c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16z" />
//             </svg>
//           </Button>
//         )}
//         {onUpdate && (
//           <>
//             <div className="vertical-line"></div>
//             <Button color="link" className="action-button update-button" onClick={onUpdate}>
//               <svg
//                 id="Layer_1"
//                 data-name="Layer 1"
//                 xmlns="http://www.w3.org/2000/svg"
//                 viewBox="0 0 122.61 122.88"
//                 width="16"
//                 height="16"
//               >
//                 <path d="M111.9,61.57a5.36,5.36,0,0,1,10.71,0A61.3,61.3,0,0,1,17.54,104.48v12.35a5.36,5.36,0,0,1-10.72,0V89.31A5.36,5.36,0,0,1,12.18,84H40a5.36,5.36,0,1,1,0,10.71H23a50.6,50.6,0,0,0,88.87-33.1ZM106.6,5.36a5.36,5.36,0,1,1,10.71,0V33.14A5.36,5.36,0,0,1,112,38.49H84.44a5.36,5.36,0,1,1,0-10.71H99A50.6,50.6,0,0,0,10.71,61.57,5.36,5.36,0,1,1,0,61.57,61.31,61.31,0,0,1,91.07,8,61.83,61.83,0,0,1,106.6,20.27V5.36Z" />
//               </svg>
//             </Button>
//           </>
//         )}
//         <Modal isOpen={isDeleteModalOpen} toggle={toggleDeleteModal}>
//           <ModalHeader toggle={toggleDeleteModal}>Confirm Deletion</ModalHeader>
//           <ModalBody>Are you sure you want to delete this record?</ModalBody>
//           <ModalFooter>
//             <Button color="danger" onClick={handleDelete}>
//               Delete
//             </Button>{" "}
//             <Button color="secondary" onClick={toggleDeleteModal}>
//               Cancel
//             </Button>
//           </ModalFooter>
//         </Modal>
//       </div>
//     )
//   }

//   if (formStatus === "Insert" && canDelete) {
//     return (
//       <div className="row-action">
//         <Button color="link" className="action-button delete-button" onClick={toggleDeleteModal}>
//           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="16" height="16">
//             <path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0L284.2 0c12.1 0 23.2 6.8 28.6 17.7L320 32l96 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 96C14.3 96 0 81.7 0 64S14.3 32 32 32l96 0 7.2-14.3zM32 128l384 0 0 320c0 35.3-28.7 64-64 64L96 512c-35.3 0-64-28.7-64-64l0-320zm96 64c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16z" />
//           </svg>
//         </Button>
//         <Modal isOpen={isDeleteModalOpen} toggle={toggleDeleteModal}>
//           <ModalHeader toggle={toggleDeleteModal}>Confirm Deletion</ModalHeader>
//           <ModalBody>Are you sure you want to delete this record?</ModalBody>
//           <ModalFooter>
//             <Button color="danger" onClick={handleDelete}>
//               Delete
//             </Button>{" "}
//             <Button color="secondary" onClick={toggleDeleteModal}>
//               Cancel
//             </Button>
//           </ModalFooter>
//         </Modal>
//       </div>
//     )
//   }

//   return null
// }

// export default RowAction




import { useState } from "react"
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap"

const RowAction = ({ formStatus, canDelete, onDelete, onUpdate }) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const toggleDeleteModal = () => setIsDeleteModalOpen(!isDeleteModalOpen)

  const handleDelete = () => {
    if (canDelete) {
      onDelete()
      toggleDeleteModal()
    }
  }

  return (
    <div className={`row-action ${formStatus === "Insert" ? "insert-mode" : ""}`}>
     {formStatus !== "" && formStatus !== "Query" && <Button color="link" className="action-button delete-button" onClick={toggleDeleteModal} disabled={!canDelete}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="16" height="16">
          <path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0L284.2 0c12.1 0 23.2 6.8 28.6 17.7L320 32l96 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 96C14.3 96 0 81.7 0 64S14.3 32 32 32l96 0 7.2-14.3zM32 128l384 0 0 320c0 35.3-28.7 64-64 64L96 512c-35.3 0-64-28.7-64-64l0-320zm96 64c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16z" />
        </svg>
      </Button>}
      {formStatus === "Update" && onUpdate && (
        <>
          <div className="vertical-line"></div>
          <Button color="link" className="action-button update-button" onClick={onUpdate}>
            <svg
              id="Layer_1"
              data-name="Layer 1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 122.61 122.88"
              width="16"
              height="16"
            >
              <path d="M111.9,61.57a5.36,5.36,0,0,1,10.71,0A61.3,61.3,0,0,1,17.54,104.48v12.35a5.36,5.36,0,0,1-10.72,0V89.31A5.36,5.36,0,0,1,12.18,84H40a5.36,5.36,0,1,1,0,10.71H23a50.6,50.6,0,0,0,88.87-33.1ZM106.6,5.36a5.36,5.36,0,1,1,10.71,0V33.14A5.36,5.36,0,0,1,112,38.49H84.44a5.36,5.36,0,1,1,0-10.71H99A50.6,50.6,0,0,0,10.71,61.57,5.36,5.36,0,1,1,0,61.57,61.31,61.31,0,0,1,91.07,8,61.83,61.83,0,0,1,106.6,20.27V5.36Z" />
            </svg>
          </Button>
        </>
      )}
      <Modal isOpen={isDeleteModalOpen} toggle={toggleDeleteModal}>
        <ModalHeader toggle={toggleDeleteModal}>Confirm Deletion</ModalHeader>
        <ModalBody>Are you sure you want to delete this record?</ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={handleDelete} disabled={!canDelete}>
            Delete
          </Button>{" "}
          <Button color="secondary" onClick={toggleDeleteModal}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}

export default RowAction


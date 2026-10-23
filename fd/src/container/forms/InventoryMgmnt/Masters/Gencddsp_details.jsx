import React from "react";
import { Container, Row, Col } from "reactstrap";
import TextArea from "../../../../components/basic/textArea";
import TextField from "../../../../components/basic/textField";
import ButtonUi from "../../../../components/basic/button";
   

    // for nested array
// const GencddspDetail = ({ formData, handleChange, formStatus }) => {
//   return (
//     <Container>
//       <Row>
//         <Col lg={6}>
//           <Row>
//             <span className="text-center">Barrel 1</span>
//             <TextArea
//               text="text"
//               value={formData.level1 || ""}
//               onChange={(e) => handleChange("level1", e.target.value)}
//               disabled
//             />
//           </Row>
//           <Row>
//             <TextField
//               type="text"
//               value={formData.cat_desc || ""}
//               onChange={(e) => handleChange("cat_desc", e.target.value)}
//             />
//           </Row>
//         </Col>
//         <Col lg={6} className="mt-lg-0 mt-md-2 mt-sm-2">
//           <Row>
//             <span className="text-center">Barrel 2</span>
//             <TextArea
//               text="text"
//               value={formData.BarrelTwoInitData[0]?.level2 || ""}
//               onChange={(e) =>
//                 handleChange("BarrelTwoInitData.0.level2", e.target.value)
//               }
//               disabled
//             />
//           </Row>
//           <Row>
//             <TextField
//               type="text"
//               value={formData.BarrelTwoInitData[0]?.cat_desc || ""}
//               onChange={(e) =>
//                 handleChange("BarrelTwoInitData.0.cat_desc", e.target.value)
//               }
//             />
//           </Row>
//         </Col>
//       </Row>

//       <Row className="mt-3">
//         <Col lg={6}>
//           <Row>
//             <span className="text-center">Barrel 3</span>
//             <TextArea
//               text="text"
//               value={formData.BarrelThreeInitData[0]?.level3 || ""}
//               onChange={(e) =>
//                 handleChange("BarrelThreeInitData.0.level3", e.target.value)
//               }
//               disabled
//             />
//           </Row>
//           <Row>
//             <TextField
//               type="text"
//               value={formData.BarrelThreeInitData[0]?.cat_desc || ""}
//               onChange={(e) =>
//                 handleChange("BarrelThreeInitData.0.cat_desc", e.target.value)
//               }
//             />
//           </Row>
//         </Col>
//         <Col lg={6} className="mt-lg-0 mt-md-2 mt-sm-2">
//           <Row>
//             <span className="text-center">Barrel 4</span>
//             <TextArea
//               text="text"
//               value={formData.BarrelFourInitData[0]?.level4 || ""}
//               onChange={(e) =>
//                 handleChange("BarrelThreeInitData.0.level4", e.target.value)
//               }
//               disabled
//             />
//           </Row>
//           <Row>
//             <TextField
//               type="text"
//               value={formData.BarrelFourInitData[0]?.cat_desc || ""}
//               onChange={(e) =>
//                 handleChange("BarrelFourInitData.0.cat_desc", e.target.value)
//               }
//             />
//           </Row>
//         </Col>
//       </Row>

//       <Row className="mt-1">
//         <Col lg="6" className="mt-3">
//           <TextField
//             type="text"
//             value={formData.GencddspDispLevels[0]?.code_display || ""}
//             onChange={(e) => handleChange("GencddspDispLevels.0.code_display", e.target.value)}
//             disabled
//           />
//         </Col>
//         <Col md={6} lg={2} className="mt-lg-3 mt-md-2">
//           <ButtonUi color="dark" outline>
//             Generate Code
//           </ButtonUi>
//         </Col>
//         <Col md={3} lg={1} className=" mt-md-2 mt-lg-3">
//           <ButtonUi color="dark" outline>
//             Exit
//           </ButtonUi>
//         </Col>
//       </Row>
//     </Container>
//   );
// };
  

// for each state
const GencddspDetail = ({ formData, barrelTwo, barrelThree, barrelFour, gencddspDispLevels, handleChange, formStatus }) => {
  return (
    <Container>
      {/* Barrel 1 */}
      <Row>
        <Col lg={6}>
          <Row>
            <span className="text-center">Barrel 1</span>
            <TextArea
              text="text"
              value={formData.level1 || ""}
              onChange={(e) => handleChange("level1", e.target.value, "formData")}
              disabled
            />
          </Row>
          <Row>
            <TextField
              type="text"
              value={formData.cat_desc || ""}
              onChange={(e) => handleChange("cat_desc", e.target.value, "formData")}
            />
          </Row>
        </Col>

        {/* Barrel 2 */}
        <Col lg={6}>
          <Row>
            <span className="text-center">Barrel 2</span>
            <TextArea
              text="text"
              value={barrelTwo.level2 || ""}
              onChange={(e) => handleChange("level2", e.target.value, "barrelTwo")}
              disabled
            />
          </Row>
          <Row>
            <TextField
              type="text"
              value={barrelTwo.cat_desc || ""}
              onChange={(e) => handleChange("cat_desc", e.target.value, "barrelTwo")}
            />
          </Row>
        </Col>
      </Row>

      {/* Barrel 3 */}
      <Row className="mt-3">
        <Col lg={6}>
          <Row>
            <span className="text-center">Barrel 3</span>
            <TextArea
              text="text"
              value={barrelThree.level3 || ""}
              onChange={(e) => handleChange("level3", e.target.value, "barrelThree")}
              disabled
            />
          </Row>
          <Row>
            <TextField
              type="text"
              value={barrelThree.cat_desc || ""}
              onChange={(e) => handleChange("cat_desc", e.target.value, "barrelThree")}
            />
          </Row>
        </Col>

        {/* Barrel 4 */}
        <Col lg={6}>
          <Row>
            <span className="text-center">Barrel 4</span>
            <TextArea
              text="text"
              value={barrelFour.level4 || ""}
              onChange={(e) => handleChange("level4", e.target.value, "barrelFour")}
              disabled
            />
          </Row>
          <Row>
            <TextField
              type="text"
              value={barrelFour.cat_desc || ""}
              onChange={(e) => handleChange("cat_desc", e.target.value, "barrelFour")}
            />
          </Row>
        </Col>
      </Row>

      {/* Code Display */}
      <Row className="mt-1">
        <Col lg="6" className="mt-3">
          <TextField
            type="text"
            value={gencddspDispLevels.code_display || ""}
            onChange={(e) => handleChange("code_display", e.target.value, "gencddspDispLevels")}
            disabled
          />
        </Col>
        <Col md={6} lg={2} className="mt-lg-3 mt-md-2">
          <ButtonUi color="dark" outline>
            Generate Code
          </ButtonUi>
        </Col>
        <Col md={3} lg={1} className=" mt-md-2 mt-lg-3">
          <ButtonUi color="dark" outline>
            Exit
          </ButtonUi>
        </Col>
      </Row>
    </Container>
  );
};


export default GencddspDetail;

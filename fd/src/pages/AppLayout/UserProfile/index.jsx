import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
} from "reactstrap";
import { RiUserLine, RiPhoneLine, RiMailLine, RiCameraLine } from "react-icons/ri";
import { updateUserProfile } from "../../../features/auth/authSlice";

const UserProfile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.userEmail || "",
    phoneNumber: user?.userPhNo || "",
    userId: user?.id,
  });

  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.userAvatar || "");

  useEffect(() => {
    if (user?.userAvatar) {
      setPreviewUrl(user.userAvatar);
    }
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [user]);

  // Handle text input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Submit profile update
  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedUserData = new FormData();

    // Append text fields
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        updatedUserData.append(key, value);
      }
    });

    // Append picture if selected
    if (profilePicture) {
      updatedUserData.append("profilePicture", profilePicture);
    }

    dispatch(updateUserProfile(updatedUserData));
  };

  return (
    <Container className="mt-2">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="px-4">
            <CardBody>
              {/* Profile Picture */}
              <div className="text-center mb-3">
                {previewUrl ? (
                  <img
                    src={
                      previewUrl.startsWith("http")
                        ? previewUrl
                        : `${import.meta.env.VITE_API_BASE_URL || ""}${previewUrl}`
                    }
                    alt="Profile"
                    className="rounded-circle"
                    style={{
                      width: "150px",
                      height: "150px",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <RiUserLine
                    style={{
                      width: "150px",
                      height: "150px",
                      color: "#ccc",
                      border: "2px solid #ddd",
                      borderRadius: "50%",
                      padding: "20px",
                    }}
                  />
                )}
              </div>

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <FormGroup>
                      <Label>
                        <RiUserLine className="me-2" />
                        First Name
                      </Label>
                      <Input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label>
                        <RiUserLine className="me-2" />
                        Last Name
                      </Label>
                      <Input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </FormGroup>
                  </Col>
                </Row>

                <FormGroup>
                  <Label>
                    <RiMailLine className="me-2" />
                    Email
                  </Label>
                  <Input type="email" value={formData.email} readOnly />
                </FormGroup>

                <FormGroup>
                  <Label>
                    <RiPhoneLine className="me-2" />
                    Phone Number
                  </Label>
                  <Input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                  />
                </FormGroup>

                <FormGroup>
                  <Label for="profilePicture">
                    <RiCameraLine className="me-2" />
                    Update Profile Picture
                  </Label>
                  <Input
                    type="file"
                    id="profilePicture"
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                </FormGroup>

                <Button color="primary" type="submit" block>
                  Update Profile
                </Button>
              </Form>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UserProfile;

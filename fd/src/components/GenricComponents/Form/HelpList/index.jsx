import React from "react";
import styles from "./style.module.scss";
import Button from "../../../Button";
import { CgSearchLoading } from "react-icons/cg";
import toast from "react-hot-toast";

const HelpList = ({
  dataType,
  dataList,
  handleChange,
  handleHelpState,
  handleDivisionChange,
  currIndex,
  //rowIndex,
  divisionData,
  locationData,
  onItemSelect,
  handleLocationChange,
}) => {
  return (
    <div className={styles["Help_list_container"]}>
      <div className={styles["btn_style"]}>
        <Button onClick={() => handleHelpState(false)}> X </Button>
      </div>
      <div className={styles["table_container"]}>
        <table className={styles.table}>
          <thead>
            {
              dataType === "employee" ? (
                <tr>
                  <th>Employee Code</th>
                  <th>Employee Name</th>
                </tr>
              ) : dataType === "division" ? (
                <tr>
                  <th>Division ID</th>
                  <th>Division Name</th>
                </tr>
              ) : dataType === "location" ? (
                <tr>
                  <th>Location ID</th>
                  <th>Location Name</th>
                </tr>
              ) : null // Return null for invalid data type
            }
          </thead>
          <tbody>
            {dataType === "employee" && dataList.length > 0 ? (
              dataList.map((item) => (
                <tr
                  key={item.emp_cd} // Ensure unique key based on data structure
                  onClick={() => {
                    handleChange("emp_cd", item.emp_cd);
                    handleChange("emp_name", item.emp_name);
                    handleHelpState(false); // Close help list after selection
                  }}
                  className="cursor-pointer hover:bg-slate-300"
                >
                  <td>{item.emp_cd}</td>
                  <td>{item.emp_name}</td>
                </tr>
              ))
            ) : dataType === "division" && dataList.length > 0 ? (
              dataList.map((item) => (
                <tr
                  key={item.division_id} // Ensure unique key based on data structure
                  onClick={() => {
                    // Check for duplicates in divisionData
                    const isDuplicate = divisionData.some(
                      (division, idx) =>
                        division.division_id === item.division_id && idx !== currIndex
                    );

                    if (isDuplicate) { 
                      console.log("this division already exists.")
                      toast.error("This division already exists."); // Show error message
                      return; // Prevent further execution if duplicate is found
                    }
                    onItemSelect(item);
                    // console.log(
                    //   "Selected Division:",
                    //   item.name,
                    //   item.division_id,
                    //   "rowindex:",
                    //   currIndex
                    // ); 

                    //handleDivisionChange("name", item.name, currIndex);
                    handleDivisionChange(
                      "division_id",
                      item.division_id,
                      currIndex
                    );
                    handleDivisionChange("name", item.name, currIndex);
                    handleHelpState(false); // Close help list after selection
                  }}
                  className="cursor-pointer hover:bg-slate-300"
                >
                  <td>{item.division_id}</td>
                  <td>{item.name}</td>
                </tr>
              ))
            ) : dataType === "location" && dataList.length > 0 ? (
              dataList.map((item) => (
                <tr
                  key={item.location_id} // Ensure unique key based on data structure
                  onClick={() => {
                    // Check for duplicates in locationData
                    const isDuplicate = locationData.some(
                      (location, idx) =>
                        location.location_desc === item.location_desc &&
                        idx !== currIndex
                    );

                    if (isDuplicate) { 
                      console.log("this location already exists")
                      toast.error("This location already exists."); 
                      return; 
                    }

                    onItemSelect(item);
                    // console.log(
                    //   "Selected Location:",
                    //   item.location_id,
                    //   item.location_desc,
                    //   "rowindex:",
                    //   currIndex
                    // );
                    handleLocationChange(
                      "location_id",
                      item.location_id,
                      currIndex
                    );
                    handleLocationChange(
                      "location_desc",
                      item.location_desc,
                      currIndex
                    );
                    handleHelpState(false);
                  }}
                  className="cursor-pointer hover:bg-slate-300"
                >
                  <td>{item.location_id}</td>
                  <td>{item.location_desc}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className={styles.no_data}>
                  <CgSearchLoading className="h-full w-full" />
                  <p className="text-lg font-extrabold text-gray-400 flex justify-center items-center">
                    No Data found
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HelpList;

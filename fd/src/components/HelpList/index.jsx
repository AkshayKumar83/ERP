import React, { useState, useEffect, useRef } from "react";
import styles from "./style.module.scss";
import Button from "../Button";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

function HelpList({
  formStatus,
  helpFor,
  apiUrl,
  helpListHeader = [],
  onSelectHelpItem = () => {},
  handleHelpList = () => {},
  queryPera = {},
  whereClause = {},
}) {
  const [allData, setAllData] = useState([]);
  const [displayedData, setDisplayedData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsToShow, setItemsToShow] = useState(500);
  const [focusedRow, setFocusedRow] = useState(0);

  const observerRef = useRef();
  const searchRef = useRef(null);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (searchRef.current) {
      searchRef.current.focus();
      setFocusedRow(0); // Focus on first row only when helpList opens
    }
  }, []);

  useEffect(() => {
    const fetchHelpListData = async () => {
      let API_URL = `${apiUrl}?form_status=${formStatus}&help_list=${helpFor}`;

      if (queryPera && Object.keys(queryPera).length) {
        API_URL = `${apiUrl}?help_list=${helpFor}&form_status=${formStatus}&appDivisionId=${user?.global_division_id}&appFinYear=${user?.global_fin_year}&appUserId=${user?.id}`;
      }

      if (whereClause && Object.keys(whereClause).length) {
        API_URL = `${apiUrl}?help_list=${helpFor}&form_status=${formStatus}&appDivisionId=${user?.global_division_id}&appFinYear=${user?.global_fin_year}&appUserId=${user?.id}`;
        const queryParams = Object.entries(whereClause)
          .map(
            ([key, value]) =>
              `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
          )
          .join("&");
        API_URL += `&${queryParams}`;
      }

      try {
        const response = await fetch(API_URL, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          const errorData = await response.json();
          // toast.error(errorData.errMsg || "Failed to fetch data.");
          // return;
          throw new Error(errorData.message || "Failed to fetch data and error message from server.");
        }

        const data = await response.json();
        setAllData(data);
        setDisplayedData(data.slice(0, itemsToShow));
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error(error.message || "An error occurred while fetching data.");
      }
    };

    if (formStatus) {
      fetchHelpListData();
    }
  }, [helpFor, formStatus, apiUrl]);

  // ✅ Smart filtering and focus update (only 1 effect now)
  useEffect(() => {
    const filtered = allData.filter((item) =>
      Object.values(item).some(
        (value) =>
          typeof value === "string" &&
          value.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    const sliced = filtered.slice(0, itemsToShow);
    setDisplayedData(sliced);

    // Only reset focus if current focus is invalid
    setFocusedRow((prev) =>
      sliced.length === 0 ? 0 : Math.min(prev, sliced.length - 1)
    );
  }, [searchTerm, allData, itemsToShow]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const selectHelpItem = (data) => {
    onSelectHelpItem(data);
    handleHelpList(false);
  };

  const loadMoreItems = () => {
    if (displayedData.length < allData.length) {
      setItemsToShow((prev) => prev + 1000);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadMoreItems();
        }
      },
      { threshold: 1.0 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [displayedData]);

  useEffect(() => {
    const rowEl = document.getElementById(`row-${focusedRow}`);
    if (rowEl) rowEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [focusedRow]);

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      setFocusedRow((prev) =>
        Math.min(prev + 1, displayedData.length - 1)
      );
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      setFocusedRow((prev) => Math.max(prev - 1, 0));
      e.preventDefault();
    } else if (e.key === "Enter") {
      if (displayedData[focusedRow]) {
        selectHelpItem(displayedData[focusedRow]);
      }
    }
  };

  if (!["Insert", "Update", "Search"].includes(formStatus)) return null;

  return (
    <div
      id="help-list"
      className={styles.helplist}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.search_container}>
        <input
          ref={searchRef}
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearch}
          className={styles.search_input}
        />
      </div>

      <div className={styles.table__container}>
        <table className={styles.table}>
          <thead>
            <tr>
              {helpListHeader.map((header, index) => (
                <th key={index}>{header.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayedData.map((data, rowIndex) => (
              <tr
                key={rowIndex}
                id={`row-${rowIndex}`}
                className={
                  rowIndex === focusedRow ? styles.focusedRow : ""
                }
                onClick={() => selectHelpItem(data, rowIndex)}
              >
                {helpListHeader.map((header, index) => (
                  <td key={index} className={styles.table__cell}>
                    {data[header.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <div ref={observerRef} style={{ height: "20px" }} />
      </div>
    </div>
  );
}

export default HelpList;

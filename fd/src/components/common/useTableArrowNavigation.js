



import { useEffect } from "react";

const useGlobalGridNavigation = () => {

  useEffect(() => {

    const getFocusable = (row) => {
      return row.querySelector(
        "input:not([disabled]), select:not([disabled]), textarea:not([disabled]), checkbox:not([disabled])"
      );
    };

    const handleKeyDown = (e) => {

      if (!["ArrowUp", "ArrowDown"].includes(e.key)) return;

      const active = document.activeElement;
      const row = active.closest("tr");
      const table = active.closest("table");

      if (!row || !table) return;

      const rows = Array.from(table.querySelectorAll("tbody tr"));
      let rowIndex = rows.indexOf(row);

      let nextRow = null;

      if (e.key === "ArrowDown") {
        rowIndex++;
        while (rowIndex < rows.length) {
          if (getFocusable(rows[rowIndex])) {
            nextRow = rows[rowIndex];
            break;
          }
          rowIndex++;
        }
      }

      if (e.key === "ArrowUp") {
        rowIndex--;
        while (rowIndex >= 0) {
          if (getFocusable(rows[rowIndex])) {
            nextRow = rows[rowIndex];
            break;
          }
          rowIndex--;
        }
      }

      if (nextRow) {

        e.preventDefault();

        const focusable = getFocusable(nextRow);

        focusable?.focus();

        nextRow.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });

      }

    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };

  }, []);

};

export default useGlobalGridNavigation;



// import { useEffect } from "react";

// const useGlobalGridNavigation = () => {

//   useEffect(() => {

//     const handleMouseDown = (e) => {

//       const cell = e.target.closest("td");
//       const row = e.target.closest("tr");

//       if (!cell || !row) return;

//       const focusable = row.querySelector(
//         "input:not([disabled]), select:not([disabled]), textarea:not([disabled])"
//       );

//       if (focusable) {
//         setTimeout(() => {
//           focusable.focus();
//         }, 0);
//       }

//     };

//     const handleKeyDown = (e) => {

//       if (!["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) return;

//       const active = document.activeElement;
//       if (!active) return;

//       const cell = active.closest("td");
//       const row = active.closest("tr");
//       const table = active.closest("table");

//       if (!cell || !row || !table) return;

//       const rows = Array.from(table.querySelectorAll("tbody tr"));

//       const rowIndex = rows.indexOf(row);
//       const cellIndex = Array.from(row.children).indexOf(cell);

//       let nextInput = null;
//       let nextRow = null;

//       if (e.key === "ArrowDown") {
//         nextRow = rows[rowIndex + 1];
//         nextInput = nextRow?.children[cellIndex]?.querySelector("input,select,textarea");
//       }

//       if (e.key === "ArrowUp") {
//         nextRow = rows[rowIndex - 1];
//         nextInput = nextRow?.children[cellIndex]?.querySelector("input,select,textarea");
//       }

//       if (e.key === "ArrowRight") {
//         nextRow = row;
//         nextInput = row.children[cellIndex + 1]?.querySelector("input,select,textarea");
//       }

//       if (e.key === "ArrowLeft") {
//         nextRow = row;
//         nextInput = row.children[cellIndex - 1]?.querySelector("input,select,textarea");
//       }

//       if (nextInput) {

//         e.preventDefault();
//         nextInput.focus();

//         nextRow?.scrollIntoView({
//           behavior: "smooth",
//           block: "center"
//         });

//       }

//     };

//     document.addEventListener("keydown", handleKeyDown);
//     document.addEventListener("mousedown", handleMouseDown);

//     return () => {
//       document.removeEventListener("keydown", handleKeyDown);
//       document.removeEventListener("mousedown", handleMouseDown);
//     };

//   }, []);

// };

// export default useGlobalGridNavigation;


// import { useEffect } from "react";

// const useTableArrowNavigation = ({
//  focusedRowIndex,
//   setFocusedRowIndex,
//   rowCount,
//   tableId
// }) => {

// //   const scrollToRow = (rowIndex) => {
// //     const row = document.querySelector(
// //       `#${tableId} tr[data-row="${rowIndex}"]`
// //     );

// //     if (row) {
// //       row.scrollIntoView({
// //         block: "nearest",
// //         behavior: "smooth"
// //       });
// //     }
// //   };

// const scrollToRow = (rowIndex) => {
//   const row = document.querySelector(
//     `#${tableId} tr[data-row="${rowIndex}"]`
//   );

//   if (row) {
//     row.scrollIntoView({
//       behavior: "smooth",
//       block: "center"
//     });
//   }
// };

//   useEffect(() => {

//     const handleKeyDown = (e) => {

//       if (e.key === "ArrowDown") {
//         setFocusedRowIndex((prev) => {
//           const next = prev < rowCount - 1 ? prev + 1 : prev;
//           scrollToRow(next);
//           return next;
//         });
//       }

//       if (e.key === "ArrowUp") {
//         setFocusedRowIndex((prev) => {
//           const next = prev > 0 ? prev - 1 : prev;
//           scrollToRow(next);
//           return next;
//         });
//       }

//       if (e.key === "Enter") {
//         const inputs = document.querySelectorAll(
//           `#${tableId} tr[data-row="${focusedRowIndex}"] input`
//         );

//         if (inputs.length) {
//           inputs[0].focus();
//         }
//       }

//     };

//     window.addEventListener("keydown", handleKeyDown);

//     return () => {
//       window.removeEventListener("keydown", handleKeyDown);
//     };

//   }, [rowCount, focusedRowIndex]);

// };

// export default useTableArrowNavigation;
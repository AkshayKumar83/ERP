import React from "react"
import ButtonUi from "../../../components/basic/button"


// interface TablePaginationProps {
//   currentPage: number
//   totalPages: number
//   onPageChange: (page: number) => void
// }

const TablePagination = ({ currentPage, totalPages, onPageChange }) => {
    return (
        <div className="flex items-center justify-between px-1 py-1 border-gray-200 sm:px-6">

            <nav
                className="inline-flex items-center justify-center rounded-md shadow-sm fixed top-0 left-0 w-full bg-white py-1 z-10"
                aria-label="Pagination"
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflowY: "hidden", // Ensures no vertical scrolling
                        gap: "4px", // Adds consistent spacing between buttons
                        padding: "0 6px", // Adds some padding around the buttons
                    }}
                >
                  
                    <div>
                        <ButtonUi
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            variant="outline"
                            className="px-1 py-1 border rounded text-sm  hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </ButtonUi>
                    </div>

                    {/* Center Section: Page Info */}
                    <div>
                        <p className="text-sm text-gray-700">
                            Showing page <span className="font-medium">{currentPage}</span> of{" "}
                            <span className="font-medium">{totalPages}</span>
                        </p>
                    </div>

                    {/* Right Section: Next Button */}
                    <div>
                        <ButtonUi
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            variant="outline"
                            className="px-1 py-1 border rounded text-sm  hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </ButtonUi>
                    </div>


                    {/* Previous Button */}
                    <ButtonUi
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        variant="outline"
                        className="px-1 py-1 rounded-l-md"
                    >
                        Previous
                    </ButtonUi> 



                    {/* Dynamically Render Page Buttons */}
                    {Array.from({ length: totalPages }, (_, index) => index + 1)
                        .filter((page) => {
                            if (totalPages <= 5) return true; // Show all pages if less than 5
                            if (currentPage <= 3) return page <= 5 || page === totalPages; // First pages
                            if (currentPage >= totalPages - 2)
                                return page >= totalPages - 4 || page === 1; // Last pages
                            return (
                                Math.abs(currentPage - page) <= 2 || page === 1 || page === totalPages
                            ); // Middle pages
                        })
                        .map((page, index, filteredPages) => (
                            <React.Fragment key={page}>
                                {index > 0 &&
                                    page !== filteredPages[index - 1] + 1 && ( // Add ellipsis for skipped pages
                                        <span className="px-1 py-1">...</span>
                                    )}
                                <ButtonUi
                                    onClick={() => onPageChange(page)}
                                    variant={currentPage === page ? "default" : "outline"}
                                    className="px-1 py-1"
                                >
                                    {page}
                                </ButtonUi>
                            </React.Fragment>
                        ))}

                    {/* Next Button */}
                    <ButtonUi
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        variant="outline"
                        className="px-1 py-1 rounded-r-md"
                    >
                        Next
                    </ButtonUi>
                </div>
            </nav>
        </div>
    );
};

export default TablePagination;

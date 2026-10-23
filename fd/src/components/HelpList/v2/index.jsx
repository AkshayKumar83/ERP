import { Modal, ModalBody, ModalHeader } from "reactstrap";
import styles from "./style.module.scss";
import { useEffect, useState } from "react";

const HelpListV2 = ({
    uniqKey,
    open,
    onClose,
    title = "",
    headers = [],   // label, key
    list = [],
    searchKeys = [],
    onSelectItem = (item) => { },
    size = 'md'
}) => {
    const [searchTerm, setSearchTerm] = useState("");    
    const [originalList, setOriginalList] = useState(list);
    const [filteredList, setFilteredList] = useState(list);

    useEffect(() => {
        if (open) {
            setOriginalList(list);
            setFilteredList(list);
        }

        return () => {
            setSearchTerm("");
        };
    }, [list, open]);

    // Handle search input changes
    const handleSearch = (e) => {
        const term = e.target.value;
        setSearchTerm(term);

        if (term === "") {
            // If the search term is empty, show the original list
            setFilteredList(originalList);
        } else {
            // Filter the list based on the search term and searchKeys
            const filtered = originalList.filter((item) =>
                searchKeys.some((key) =>
                    String(item[key]).toLowerCase().includes(term.toLowerCase())
                )
            );
            setFilteredList(filtered);
        }
    };



    if (!open) return <></>;

    return (
        <Modal key={`${uniqKey}`} isOpen={open} toggle={onClose} size={size}>
            <ModalHeader toggle={onClose}>{title}</ModalHeader>
            <ModalBody>
                <div className={styles.helplist} >
                    <div className={styles.search_container}>
                        <input
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
                                    {headers?.map((header, index) => (
                                        <th key={index}>{header.label}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredList?.map((data, rowIndex) => (
                                    <tr
                                        key={rowIndex}
                                        id={`row-${rowIndex}`}
                                        onClick={() => onSelectItem(data)}
                                    >
                                        {headers.map((header, index) => (
                                            <td
                                                key={index}
                                                className={styles.table__cell}
                                            >
                                                {data[header.key]}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </ModalBody>
        </Modal>
    );
};

export default HelpListV2;
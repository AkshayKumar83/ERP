import { RiArrowDownSFill } from "react-icons/ri";
import styles from './style.module.scss';
import { useState } from "react";

const DropDownMenu = ({ menuList = [{}], getSelectedFormItem, isItSubmenu = false}) => {
    // Keep track of the open submenu index
    const [openSubMenuIndex, setOpenSubMenuIndex] = useState(null);

    const toggleSubMenu = (index) => {
        if (openSubMenuIndex === index) {
            setOpenSubMenuIndex(null); // Close the submenu if it's already open
        } else {
            setOpenSubMenuIndex(index); // Open the clicked submenu
        }
    };

    const handleMenuItem = (item, index) => {

        if(!item?.item){
            getSelectedFormItem(item, false);
        }else{
        }

        // Toggle submenu if it exists
        if (item?.item) {
            toggleSubMenu(index);
        }
    };

    return (
        <ul className={styles.menuList}>
            {menuList.map((item, index) => (
                <li key={index} className={styles.menuItem}>
                    <div 
                        className={styles.menuItemHeader} 
                        onClick={() => handleMenuItem(item, index)} // Pass index to track the submenu
                    >
                        {isItSubmenu?<span>{item.formName}</span>:<span>{item.formName}</span>}
                        {item.item && <RiArrowDownSFill className={styles['dropDown__menu__icon']} />}
                    </div>
                    {/* Conditionally render the submenu if it's open */}
                    {item.item && openSubMenuIndex === index && (
                        <div className={styles['submenu__container']}>
                            <DropDownMenu
                                menuList={item.item} // Recursively pass the submenu items
                                getSelectedFormItem={getSelectedFormItem}
                                isItSubmenu={true}
                            />
                        </div>
                    )}
                </li>
            ))}
        </ul>
    );
};

export default DropDownMenu;

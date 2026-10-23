
// import React, { useState, useCallback, useMemo } from 'react'
// import { FixedSizeList as List } from 'react-window'
// import { ChevronDown } from 'lucide-react'

// import Button from '../Button'
// import InputField from '../GenricComponents/Form/Input'
// import styles from './style.module.scss'

// function Row({ data, index, style }) {
//   const { options, getOptionLabel, selectedValue, onSelect, getOptionValue, customItemStyle } = data
//   const option = options[index]
//   const isSelected = selectedValue === getOptionValue(option)

//   return (
//     <div 
//       style={{...style, ...customItemStyle}}
//       className={`${styles.dropdownItem} ${isSelected ? styles.selected : ''}`}
//       role="option"
//       aria-selected={isSelected}
//       onClick={() => onSelect(option)}
//     >
//       <div className={styles.truncate} title={getOptionLabel(option)}>
//         {getOptionLabel(option)}
//       </div>
//     </div>
//   )
// }

// export default function FlexibleDropdown({
//   options,
//   getOptionLabel,
//   getOptionValue,
//   onChange,
//   placeholder = 'Select an option',
//   className = '',
//   itemHeight = 35,
//   maxHeight = 300,
//   width = '100%',
//   searchable = false,
//   virtualized = false,
//   customStyles = {}
// }) {
//   const [isOpen, setIsOpen] = useState(false)
//   const [selectedOption, setSelectedOption] = useState(null)
//   const [searchTerm, setSearchTerm] = useState('')

//   const toggleDropdown = useCallback(() => setIsOpen(prev => !prev), [])

//   const handleSelect = useCallback((option) => {
//     setSelectedOption(option)
//     onChange(option)
//     setIsOpen(false)
//   }, [onChange])

//   const filteredOptions = useMemo(() => {
//     if (!searchTerm) return options
//     return options.filter(option => 
//       getOptionLabel(option).toLowerCase().includes(searchTerm.toLowerCase())
//     )
//   }, [options, getOptionLabel, searchTerm])

//   const renderList = () => {
//     if (virtualized) {
//       return (
//         <List
//           height={Math.min(filteredOptions.length * itemHeight, maxHeight)}
//           itemCount={filteredOptions.length}
//           itemSize={itemHeight}
//           width={width}
//           itemData={{ 
//             options: filteredOptions, 
//             getOptionLabel, 
//             getOptionValue,
//             selectedValue: selectedOption ? getOptionValue(selectedOption) : null,
//             onSelect: handleSelect,
//             customItemStyle: customStyles.item
//           }}
//           className={styles.dropdownList}
//           style={customStyles.list}
//           role="listbox"
//         >
//           {Row}
//         </List>
//       )
//     } else {
//       return (
//         <div className={styles.dropdownList} role="listbox" style={{ ...customStyles.list, maxHeight, width }}>
//           {filteredOptions.map((option, index) => (
//             <Row
//               key={getOptionValue(option)}
//               data={{ 
//                 options: filteredOptions, 
//                 getOptionLabel, 
//                 getOptionValue,
//                 selectedValue: selectedOption ? getOptionValue(selectedOption) : null,
//                 onSelect: handleSelect,
//                 customItemStyle: customStyles.item
//               }}
//               index={index}
//               style={{ height: itemHeight }}
//             />
//           ))}
//         </div>
//       )
//     }
//   }

//   return (
//     <div className={`${styles.dropdown} ${className}`} style={customStyles.container}>
//       <Button 
//         onClick={toggleDropdown}
//         aria-haspopup="listbox"
//         aria-expanded={isOpen}
//         className={styles.dropdownToggle}
//         style={customStyles.button}
//       >
//         <div className={styles.truncate} style={customStyles.buttonText}>
//           {selectedOption ? getOptionLabel(selectedOption) : placeholder}
//         </div>
//         <ChevronDown className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`} style={customStyles.chevron} />
//       </Button>
//       {isOpen && (
//         <div className={styles.dropdownContent} style={customStyles.content}>
//           {searchable && (
//             <div className={styles.searchContainer} style={customStyles.searchContainer}>
//               <InputField
//                 type="text"
//                 placeholder="Search..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className={styles.searchInput}
//                 style={customStyles.searchInput}
//               />
//             </div>
//           )}
//           {renderList()}
//         </div>
//       )}
//     </div>
//   )
// }


import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { FixedSizeList as List } from 'react-window'
import { ChevronDown } from 'lucide-react'

import Button from '../Button'
import InputField from '../GenricComponents/Form/Input'
import styles from './style.module.scss'

function Row({ data, index, style }) {
  const { options, getOptionLabel, selectedValue, onSelect, getOptionValue, customItemStyle } = data
  const option = options[index]
  const isSelected = selectedValue === getOptionValue(option)

  return (
    <div 
      style={{...style, ...customItemStyle}}
      className={`${styles.dropdownItem} ${isSelected ? styles.selected : ''}`}
      role="option"
      aria-selected={isSelected}
      onClick={() => onSelect(option)}
    >
      <div className={styles.truncate} title={getOptionLabel(option)}>
        {getOptionLabel(option)}
      </div>
    </div>
  )
}

export default function FlexibleDropdown({
  options,
  getOptionLabel,
  getOptionValue,
  onChange,
  placeholder = 'Select an option',
  className = '',
  itemHeight = 35,
  maxHeight = 300,
  width = '100%',
  searchable = false,
  virtualized = false,
  customStyles = {},
  value
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (value) {
      const option = options.find(opt => getOptionValue(opt) === value)
      setSelectedOption(option)
    }
  }, [value, options, getOptionValue])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const toggleDropdown = useCallback(() => setIsOpen(prev => !prev), [])

  const handleSelect = useCallback((option) => {
    setSelectedOption(option)
    onChange(getOptionValue(option))
    setIsOpen(false)
  }, [onChange, getOptionValue])

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options
    return options.filter(option => 
      getOptionLabel(option).toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [options, getOptionLabel, searchTerm])

  const renderList = () => {
    if (virtualized) {
      return (
        <List
          height={Math.min(filteredOptions.length * itemHeight, maxHeight)}
          itemCount={filteredOptions.length}
          itemSize={itemHeight}
          width={width}
          itemData={{ 
            options: filteredOptions, 
            getOptionLabel, 
            getOptionValue,
            selectedValue: selectedOption ? getOptionValue(selectedOption) : null,
            onSelect: handleSelect,
            customItemStyle: customStyles.item
          }}
          className={styles.dropdownList}
          style={customStyles.list}
          role="listbox"
        >
          {Row}
        </List>
      )
    } else {
      return (
        <div className={styles.dropdownList} role="listbox" style={{ ...customStyles.list, maxHeight, width }}>
          {filteredOptions.map((option, index) => (
            <Row
              key={getOptionValue(option)}
              data={{ 
                options: filteredOptions, 
                getOptionLabel, 
                getOptionValue,
                selectedValue: selectedOption ? getOptionValue(selectedOption) : null,
                onSelect: handleSelect,
                customItemStyle: customStyles.item
              }}
              index={index}
              style={{ height: itemHeight }}
            />
          ))}
        </div>
      )
    }
  }

  return (
    <div className={`${styles.dropdown} ${className}`} style={customStyles.container} ref={dropdownRef}>
      <Button 
        onClick={toggleDropdown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={styles.dropdownToggle}
        style={customStyles.button}
      >
        <div className={styles.truncate} style={customStyles.buttonText}>
          {selectedOption ? getOptionLabel(selectedOption) : placeholder}
        </div>
        <ChevronDown className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`} style={customStyles.chevron} />
      </Button>
      {isOpen && (
        <div className={styles.dropdownContent} style={customStyles.content}>
          {searchable && (
            <div className={styles.searchContainer} style={customStyles.searchContainer}>
              <InputField
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
                style={customStyles.searchInput}
              />
            </div>
          )}
          {renderList()}
        </div>
      )}
    </div>
  )
}
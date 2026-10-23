// hooks/useHelpList.js
import { useState, useCallback } from 'react';

export const useHelpList = (setHelpListDataInForm) => {
  const [helpList, setHelpList] = useState(false);
  const [helpFor, setHelpFor] = useState('');
  const [helpListHeader, setHelpListHeader] = useState([]);

  const handleDoubleClick = useCallback((fieldName, helpListHeader) => {
    setHelpFor(fieldName);
    setHelpListHeader(helpListHeader);
    setHelpList(true);
  }, []);

  const handleHelpList = useCallback((show) => {
    setHelpList(show);
  }, []);

  const onSelectHelpItem = useCallback((data, index) => {
    setHelpListDataInForm(data, helpFor, index);
  }, [helpFor, setHelpListDataInForm]);

  return {
    helpList,
    helpFor,
    helpListHeader,
    handleDoubleClick,
    handleHelpList,
    onSelectHelpItem,
  };
};
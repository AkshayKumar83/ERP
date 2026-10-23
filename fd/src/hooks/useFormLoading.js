import { useState } from "react";

export const useFormLoading = () => {
    
    const [loading, setLoading] = useState(false); //do it true when the form will ready
    const [formLoading, setFormLoading] = useState(false);

    return { loading, setLoading, formLoading, setFormLoading };
};

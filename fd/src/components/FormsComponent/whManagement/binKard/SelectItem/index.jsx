import React from "react";
import InputField from "../../../../GenricComponents/Form/Input";
import styles from "./style.module.scss";
import FormLayout from "../../../../FormLayout";
import classNames from "classnames";

export default function SelectItem({ formData, formStatus, handleChange, handleHelpFor, handleHelpList }) {

    // HANDLING HELP LIST ON DOUBLE CLICK
    const handleDoubleClick=(data)=>{
            handleHelpFor(data)
            handleHelpList(true)
    }
    return (
        <FormLayout id="bin-kard-form">
            <div className={styles.selectItem}>
                <div className={classNames(styles.row, styles.row1)}>
                    <div className={styles.radioGroup}>
                        <label>
                            <InputField
                                name="ok_rej"
                                type="radio"
                                value="ok"
                                checked={formData.ok_rej === "ok"}
                                onChange={handleChange}
                            />
                            OK
                        </label>
                        <label>
                            <InputField
                                type="radio"
                                name="ok_rej"
                                value="rejection"
                                checked={formData.ok_rej === "rejection"}
                                onChange={handleChange}
                            />
                            Rejection
                        </label>
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Store</label>
                        <InputField
                            type="text"
                            name="wc_no"
                            value={formData.wc_no}
                            onChange={handleChange}
                            onDoubleClick={() => handleDoubleClick("store")}
                        />
                        <InputField
                            type="text"
                            name="wc_description"
                            value={formData.wc_description}
                            disabled
                        />
                    </div>
                </div>

                <div className={styles.row}>
                    <div className={styles.inputGroup}>
                        <label>Item</label>
                        <InputField
                            type="text"
                            name="it_code"
                            value={formData.it_code}
                            onChange={handleChange}
                            onDoubleClick={() => handleDoubleClick("item")}

                        />
                        <InputField
                            type="text"
                            name="it_name"
                            value={formData.it_name}
                            onChange={handleChange}
                            disabled
                        />
                        <InputField
                            type="text"
                            name="um_code"
                            value={formData.um_code}
                            onChange={handleChange}
                            disabled
                        />
                    </div>
                    <button>SHOW</button>
                </div>

                <div className={styles.row}>
                    <div className={styles.inputGroup}>
                        <label>From Date</label>
                        <InputField
                            type="date"
                            name="from_date"
                            value={formData.from_date}
                            onChange={handleChange}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>To Date</label>
                        <InputField
                            type="date"
                            name="to_date"
                            value={formData.to_date}
                            onChange={handleChange}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>It size</label>
                        <InputField
                            type="text"
                            name="iic_ref_no"
                            value={formData.iic_ref_no}
                            onChange={handleChange}
                            disabled
                        />
                    </div>
                </div>

                <div className={styles.row}>
                    <div className={styles.inputGroup}>
                        <label>Year OP. rate</label>
                        <InputField
                            type="text"
                            name="rate"
                            value={formData.rate}
                            onChange={handleChange}
                            readOnly
                        />
                    </div>
                    <div className={styles.inputGroup__last}>
                        <label>OPENING_DATE</label>
                        <InputField
                            type="text"
                            name="opening_balance"
                            value={formData.opening_banlance}
                            onChange={handleChange}
                            readOnly
                        />
                    </div>
                </div>
            </div>
        </FormLayout>
    );
}

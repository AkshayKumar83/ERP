exports.transformTaxDataToDbData = (data) => {
    return {
      tax_code: data.tax_code,
      tax_desc: data.tax_desc,
      acc_no: data.acc_no || null,
      st_type: data.st_type || 'L',
      sal_or_pur: data.sal_or_pur || 'S',
      tax_perc: data.tax_perc || null,
      st_form: data.st_form || null,
      create_id: data.create_id || null,
      create_date: data.create_date || null,
      update_id: data.update_id || null,
      update_date: data.update_date || null,
      separate_in_vch: data.separate_in_vch || 'N',
      refundable: data.refundable || 'N',
      surch_per: data.surch_per || null,
      prefix: data.prefix || null,
      st_prc_val: data.st_prc_val || 'P',
      active: data.active || 'Y',
      sale_acc_head: data.sale_acc_head || null,
      surch_perc: data.surch_perc || null,
    };
};


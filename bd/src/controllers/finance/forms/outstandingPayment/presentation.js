
exports.transformOutstandingHeaderToDbData = (data) => {
  return {
    outs_id: data.outs_id,                       
    trans_year: data.trans_year,                
    division_id: data.division_id,               
    trans_type: data.trans_type || "OS",          
    acc_no: data.acc_no,                          
    voucher_no: data.voucher_no,                  
    voucher_dt: data.voucher_dt,                  
    instr_no: data.instr_no || null,             
    instr_dt: data.instr_dt || null,             
    remarks: data.remarks || null,               
    debt_cred: data.debt_cred || "D",            
    create_id: data.create_id || null,                    
    create_date: data.create_date || new Date(),  
    update_id: data.update_id  || null,                    
    update_date: new Date(),                    
    journal_id: data.journal_id || null,         
    pay_adv_no: data.pay_adv_no || null,         
    pay_adv_dt: data.pay_adv_dt || null,         
    posted: data.posted || "N",                   
    origin: data.origin || "O",                 
    voucher_id: data.voucher_id || null          
  };
};
exports.transformOutstandingDetailToDbData = (data) => {
  return {
    outs_id: data.outs_id,                         
    acc_no: data.acc_no,                           
    oth_acc: data.oth_acc || null,                 
    doc_type: data.doc_type || null,               
    emp_cd: data.emp_cd || null,                   
    doc_id: data.doc_id || null,                   
    doc_no: data.doc_no,                           
    doc_dt: data.doc_dt,                           
    due_date: data.due_date,               
    db_cr: data.db_cr || "D",                      
    amount: data.amount,                           
    explanation: data.explanation || null,         
    status: data.status || "N",                    
    create_id: data.create_id,                     
    create_date: data.create_date || new Date(),   
    update_id: data.update_id,                     
    update_date: new Date(),                       
    inv_type: data.inv_type || "P",                
    due_type: data.due_type || "N",                
    party_acc: data.party_acc ,             
    write_off: data.write_off || "N",              
    wo_journal_vch_id: data.wo_journal_vch_id || null, 
    project_no: data.project_no || null,           
    so_items: data.so_items || null,               
    multi_cost_centres: data.multi_cost_centres || null 
  };
};

 
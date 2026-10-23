
exports.transformUnitmstrToDbData = (data) =>{
    return {

        unit_id:data.unit_id,
        description:data.description,
        unit:data.unit,
        fraction:data.fraction || null,
        create_id: data.create_id || null,
        create_date: data.create_date || null,
        update_id: data.update_id || null,
        update_date: data.update_date || null,

    }
}





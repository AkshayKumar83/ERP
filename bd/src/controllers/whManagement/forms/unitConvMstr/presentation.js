
exports.transformUnitConvmstrToDbData = (data) =>{
    return {

        from_id:data.from_id,
        multiplier:data.multiplier,
        to_id:data.to_id,
        create_id: data.create_id || null,
        create_date: data.create_date || new Date(),
        update_id: data.update_id || null,
        update_date: data.update_date || null,

    }
}


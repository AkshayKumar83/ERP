const generateInsertQuery = (tableName, data) => {
  // Get the columns from the first object
  const columns = Object.keys(data[0]);

  // Create placeholders dynamically
  const valuesPlaceholders = data
    .map((_, rowIndex) =>
      columns
        .map((_, colIndex) => `$${rowIndex * columns.length + colIndex + 1}`)
        .join(", ")
    )
    .join("), (");

  // Construct the query
  const query = `INSERT INTO ${tableName} (${columns.join(
    ", "
  )}) VALUES (${valuesPlaceholders}) RETURNING *`;

  return query;
};

// function cleanObject(obj) {
//     // Create a new object to store the cleaned properties
//     const cleanedObject = {};

//     // Iterate over each key-value pair in the original object
//     for (const key in obj) {
//         if (obj.hasOwnProperty(key)) {
//             // Check if the value is not null, undefined, or empty
//             // if (obj[key] !== null && obj[key] !== undefined && obj[key] !== '') { //
//             if (obj[key] !== null && obj[key] !== undefined) {
//                 if(obj[key]=== ''){
//                     cleanedObject[key] = null
//                 }
//                 cleanedObject[key] = obj[key];
//             }
//         }
//     }

//     return cleanedObject;
// }

function cleanObject(obj) {
  const cleanedObject = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      // Convert empty string ('') to null
      if (obj[key] === "") {
        cleanedObject[key] = null;
      } else if (obj[key] !== null && obj[key] !== undefined) {
        cleanedObject[key] = obj[key];
      }
    }
  }

  return cleanedObject;
}


  // below function is added by akshay dt 24.09.25
  function cleanObjectGLMstr(obj) {
  const cleanedObject = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
       // Convert empty string ('') to null
      if (obj[key] === "") {
        cleanedObject[key] = null;
      } else if (obj[key] === undefined) {
        cleanedObject[key] = null; // undefined also null 
      } else {
        cleanedObject[key] = obj[key]; // rest of same
      }
    }
  }

  return cleanedObject;
}

// generally builded this function for udpate logics
function makeNullValue(obj) {
  const cleanedObject = { ...obj }; // Create a shallow copy of the object
  for (const key in cleanedObject) {
    if (cleanedObject.hasOwnProperty(key)) {
      // Check if the value is null, undefined, or an empty string
      if (
        cleanedObject[key] === null ||
        cleanedObject[key] === undefined ||
        cleanedObject[key] === ""
      ) {
        cleanedObject[key] = null; // Set the value to null
      }
    }
  }
  return cleanedObject; // Return the updated object
}

const generateSingleInsertQuery = (
  tableName,
  data = {},
  current_date = "N"
) => {
  // data should be clean object. before passing the object as data as perameter use cleanObject fn
  // Get the columns from the cleaned object
  const columns = Object.keys(data);

  // Create placeholders dynamically

  let valuesPlaceholders = columns
    .map((_, colIndex) => `$${colIndex + 1}`)
    .join(", ");

  if (current_date !== "N") {
    columns.push("create_date");
    // valuesPlaceholders += ', CURRENT_DATE'; // Append 'CURRENT_DATE' to placeholders
    valuesPlaceholders += ", fetch_create_update_date()"; // Append 'CURRENT_DATE' to placeholders
  }

  // Create the columns part of the SQL query
  const columnsPart = columns.join(", ");

  const query = `INSERT INTO ${tableName} (${columnsPart}) VALUES (${valuesPlaceholders}) RETURNING *`;

  return query;
};

const generateSingleUpdateQuery = (tableName, data, condition) => {
  // Get the columns from the cleaned object
  const columns = Object.keys(data);

  // Create placeholders dynamically
  const setClause = columns
    .map((col, colIndex) => `${col} = $${colIndex + 1}`)
    .join(", ");

  // Construct the query
  const query = `UPDATE ${tableName} SET ${setClause} WHERE ${condition} RETURNING *`;

  return query;
};
// function to generate parameters array for query

const generateParametersArray = (data) => {
  return data.flatMap((row) => Object.values(row));
};

// generic function for removing keys form object
function removeKeysFromObject(obj, keysToRemove) {
  let newObj = { ...obj };

  if (Array.isArray(keysToRemove)) {
    keysToRemove.forEach((key) => {
      delete newObj[key];
    });
  } else if (typeof keysToRemove === "string") {
    delete newObj[keysToRemove];
  }

  return newObj;
}

//for membership form
function replaceKeysWithTemplate(obj, directory) {
  const newObj = {};

  for (const [key, value] of Object.entries(obj)) {
    // Check if the key exists in the directory
    if (!value || value === null || value === undefined) {
      continue;
    }

    if (directory.hasOwnProperty(key)) {
      // Replace key with corresponding value from directory
      newObj[directory[key]] = value;
    } else {
      // If the key is not in the directory, keep it as is
      newObj[key] = value;
    }
  }

  return newObj;
}

const transformDirectoryPayload = (directory = [], family = []) => {
  let familyIndexMap = {};
  if (!Array.isArray(directory)) {
    return [];
  }
  if (Array.isArray(family) && family.length) {
    family.forEach((data) => {
      let idx = data.individual_sno;
      if (!familyIndexMap[idx]) {
        let foundIndex = directory.findIndex(
          (item) => item.individual_sno == idx
        );
        familyIndexMap[idx] = foundIndex;
      }
      let foundIndex = familyIndexMap[idx];
      if (!directory[foundIndex].hasOwnProperty("familyDetails")) {
        directory[foundIndex]["familyDetails"] = [];
      }
      directory[foundIndex]["familyDetails"].push(data);
    });
  }
  return directory;
};

// conert into boolean data type if any keys have boolean value inside string
const convertStringsToBooleans = (obj) => {
  // Iterate over each key-value pair in the object
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      // Check if the value is a string 'true' or 'false', and convert it to a boolean
      if (value === "true") {
        return [key, true];
      } else if (value === "false") {
        return [key, false];
      }
      // Otherwise, keep the value as it is
      return [key, value];
    })
  );
};

const buildSearchQuery = (params) => {
  const conditions = [];

  Object.entries(params).forEach(([key, value]) => {
    // Skip empty
    if (value === undefined || value === null || value === "") return;

    // Case 1: 'Y' / 'N'
    if (value === "Y" || value === "N") {
      conditions.push(`${key} = '${value}'`);
    }
    // Case 2: 'true' / 'false'
    else if (value === "true" || value === "false") {
      conditions.push(`${key} = ${value === "true" ? "TRUE" : "FALSE"}`);
    }
    // Case 3: Date Detection (value looks like a date format)
    else if (isDateString(value)) {
      conditions.push(`${key} = '${value}'`);
    }
    // Case 4: String partial match
    else if (typeof value === "string" && value.trim() !== "") {
      conditions.push(`${key} LIKE '%${value}%'`);
    }
  });

  return conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";
};
  
  // Utility function to detect if value is a date string
  function isDateString(value) {
    // Basic check for YYYY-MM-DD format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (typeof value === 'string' && dateRegex.test(value)) {
      // Also check if it's a valid Date
      const date = new Date(value);
      return !isNaN(date.getTime());
    }
    return false;
  }

  const toIntOrNull = (val) => {
    if (val === undefined || val === null || val === '') return null;
  
    const parsed = parseInt(val);
    return isNaN(parsed) ? null : parsed;
  };
  
  const toBigInt = (val) => {
    if (val === undefined || val === null || val === '') return null;
    return BigInt(val);
  };
  
  const toDate = (val) => {
    if (!val) return null;
  
    const date = new Date(val);
  
    // Format as 'YYYY-MM-DD'
    return date.toISOString().split("T")[0];
  };
  
  
  const toNumber = (val) => {
    if (val === undefined || val === null || val === '') return null;
    const parsed = parseFloat(val);
    return isNaN(parsed) ? null : parsed;
  };

  function toDateTime(value) {
  if (!value) return null;

  // Handles both "2025-07-24T11:51" and "2025-07-24 11:51"
  const parsedValue = typeof value === 'string'
    ? new Date(value.replace(' ', 'T'))
    : new Date(value);

  return isNaN(parsedValue.getTime()) ? null : parsedValue;
}


const transformEmptyStringToNull = (obj) => {
  if (!obj || typeof obj !== "object") return obj;

  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key,
      value === "" ? null : value,
    ])
  );
};


const toFloat = (v) => (v !== undefined && v !== null ? parseFloat(v) : null);
  
  

module.exports = {
  generateInsertQuery,
  generateParametersArray,
  replaceKeysWithTemplate,
  transformDirectoryPayload,
  generateSingleInsertQuery,
  generateSingleUpdateQuery,
  cleanObject,
  removeKeysFromObject,
  makeNullValue,
  convertStringsToBooleans,
  buildSearchQuery,
  toIntOrNull,
  toBigInt,
  toDate,
  toNumber,
  toDateTime,
  cleanObjectGLMstr,
  transformEmptyStringToNull,
  toFloat,
};

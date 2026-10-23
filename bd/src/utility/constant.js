const dateFormate = (dt) => {
  const strDate = String(dt);
  // console.log('call inside dateFormate: ', strDate)
  const modifiedDt = strDate.split("T");
  return modifiedDt[0];
};


// this function copied from vartika during merging
const dateFormater = (newDate) => {
  // Check if newDate is null or undefined
  if (newDate === null || newDate === undefined) {
    return ""; // Return an empty string or any other default value you prefer
  }

  // Convert the input date to a Date object
  const finalDate = new Date(newDate);
  // Check if finalDate is a valid date
  if (isNaN(finalDate.getTime())) {
    return ""; // Return an empty string if the input is not a valid date
  }

  // Format the date as "yyyy-MM-dd"
  const year = finalDate.getFullYear();
  const month = String(finalDate.getMonth() + 1).padStart(2, "0");
  const day = String(finalDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};


const dateFormaterWithTime = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
};


const formatDateForExcel = (newDate) => {
  const formattedDate = dateFormater(newDate);

  if (!formattedDate) {
    return "";
  }

  const [year, month, day] = formattedDate.split("-");

  return `${day}-${month}-${year}`;
};



module.exports = {
  dateFormate,
  dateFormater,
  dateFormaterWithTime,
  formatDateForExcel
}

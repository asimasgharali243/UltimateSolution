// ✅ Format: "dd/mm/yyyy hh:mm AM/PM"
const formatDateTime = (date = new Date()) => {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  const hours = date.getHours();
  const h = String(hours % 12 || 12).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  return `${d}/${m}/${y} ${h}:${min} ${ampm}`;
};

export default formatDateTime;

// ✅ Parse: "dd/mm/yyyy hh:mm AM/PM" → ISO string
const parseScanDate = (dateStr) => {
  if (!dateStr) return new Date().toISOString();

  // Match format like "25/10/2025 11:30 PM"
  const match = dateStr.match(
    /^(\d{2})\/(\d{2})\/(\d{4}) (\d{1,2}):(\d{2}) (AM|PM)$/
  );
  if (!match) return new Date().toISOString();

  let [, dd, mm, yyyy, hh, min, ampm] = match;
  dd = parseInt(dd, 10);
  mm = parseInt(mm, 10) - 1;
  yyyy = parseInt(yyyy, 10);
  hh = parseInt(hh, 10);
  min = parseInt(min, 10);

  if (ampm === 'PM' && hh < 12) hh += 12;
  if (ampm === 'AM' && hh === 12) hh = 0;

  const date = new Date(yyyy, mm, dd, hh, min);
  return date.toISOString();
};

export default parseScanDate;

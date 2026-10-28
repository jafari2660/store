export const toPersianDigits = (value) => {
  if (value === null || value === undefined) return "";

  return String(value).replace(
    /\d/g,
    (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]
  );
};

export const formatPrice = (price) => {
  if (price === null || price === undefined || price === "") return "";

  return Number(price).toLocaleString("en-US");
};
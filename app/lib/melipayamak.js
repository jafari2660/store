
const MELIPAYAMAK_API_URL =
  "https://rest.payamak-panel.com/api/SendSMS/SendSMS";

const MELIPAYAMAK_USERNAME = process.env.MELIPAYAMAK_USERNAME;
const MELIPAYAMAK_PASSWORD = process.env.MELIPAYAMAK_PASSWORD;

export async function sendSms(phone, message) {
  const from = process.env.MELIPAYAMAK_FROM_NUMBER;

  if (!MELIPAYAMAK_USERNAME || !MELIPAYAMAK_PASSWORD || !from) {
    throw new Error("اطلاعات اتصال ملی‌پیامک کامل نیست");
  }

  const payload = new URLSearchParams({
    username: MELIPAYAMAK_USERNAME,
    password: MELIPAYAMAK_PASSWORD,
    to: phone,
    from,
    text: message,
    isflash: "false",
  });

  try {
    const response = await fetch(MELIPAYAMAK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: payload.toString(),
    });

    const responseText = await response.text();

    console.log("MELIPAYAMAK HTTP STATUS:", response.status);
    console.log("MELIPAYAMAK RAW RESPONSE:", responseText);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${responseText}`);
    }

    const data = JSON.parse(responseText);

    if (Number(data.RetStatus) !== 1) {
      throw new Error(
        data.StrRetStatus || `خطای ارسال: ${data.RetStatus}`
      );
    }

    return data;
  } catch (error) {
    console.error("MeliPayamak Error:", error.message);
    throw error;
  }
}

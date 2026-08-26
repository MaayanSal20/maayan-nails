import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_ADDRESS,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export async function sendResetCodeEmail(to: string, code: string) {
  try {
    await transporter.sendMail({
      from: `"Maayan Nails" <${process.env.GMAIL_ADDRESS}>`,
      to,
      subject: 'קוד לאיפוס סיסמה - Maayan Nails',
      html: `
        <div style="font-family: sans-serif; direction: rtl; text-align: right;">
          <h2 style="color: #7A3B4A;">איפוס סיסמה</h2>
          <p>קיבלנו בקשה לאיפוס הסיסמה שלך באתר Maayan Nails.</p>
          <p>קוד האימות שלך:</p>
          <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #D97D8C;">${code}</p>
          <p style="color: #888; font-size: 13px;">הקוד בתוקף ל-15 דקות. אם לא ביקשת איפוס סיסמה, אפשר להתעלם מהודעה זו.</p>
        </div>
      `,
    })
  } catch (error) {
    console.error('שגיאה בשליחת אימייל:', error)
    throw new Error('שגיאה בשליחת אימייל')
  }
}
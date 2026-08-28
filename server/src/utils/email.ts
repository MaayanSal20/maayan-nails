import { BrevoClient } from '@getbrevo/brevo'

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY!,
})

export async function sendResetCodeEmail(to: string, code: string) {
  try {
    await brevo.transactionalEmails.sendTransacEmail({
      subject: 'קוד לאיפוס סיסמה - Maayan Nails',
      htmlContent: `
        <div style="font-family: sans-serif; direction: rtl; text-align: right;">
          <h2 style="color: #7A3B4A;">איפוס סיסמה</h2>
          <p>קיבלנו בקשה לאיפוס הסיסמה שלך באתר Maayan Nails.</p>
          <p>קוד האימות שלך:</p>
          <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #D97D8C;">${code}</p>
          <p style="color: #888; font-size: 13px;">הקוד בתוקף ל-15 דקות. אם לא ביקשת איפוס סיסמה, אפשר להתעלם מהודעה זו.</p>
        </div>
      `,
      sender: { name: 'Maayan Nails', email: process.env.BREVO_SENDER_EMAIL! },
      to: [{ email: to }],
    })
  } catch (error) {
    console.error('שגיאה בשליחת אימייל:', error)
    throw new Error('שגיאה בשליחת אימייל')
  }
}

export async function sendVerificationEmail(to: string, code: string) {
  try {
    await brevo.transactionalEmails.sendTransacEmail({
      subject: 'אימות כתובת אימייל - Maayan Nails',
      htmlContent: `
        <div style="font-family: sans-serif; direction: rtl; text-align: right;">
          <h2 style="color: #7A3B4A;">ברוכה הבאה ל-Maayan Nails!</h2>
          <p>כדי לוודא שכתובת האימייל שלך תקינה (ותוכלי לשחזר סיסמה בעתיד), נא הזיני את הקוד הבא באתר:</p>
          <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #D97D8C;">${code}</p>
          <p style="color: #888; font-size: 13px;">הקוד בתוקף ל-15 דקות.</p>
        </div>
      `,
      sender: { name: 'Maayan Nails', email: process.env.BREVO_SENDER_EMAIL! },
      to: [{ email: to }],
    })
  } catch (error) {
    console.error('שגיאה בשליחת אימייל אימות:', error)
    throw new Error('שגיאה בשליחת אימייל')
  }
}
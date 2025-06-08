import nodemailer from "nodemailer";
import { validateContactInput } from "../utils/validateContact.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Function to generate AI response
async function generateAIResponse(name, subject, message) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Use chat mode instead of generateContent (chat is supported in free tier)
    const chat = model.startChat({
      history: [], // optional conversation history
    });

    const prompt = `
Write a professional response to this customer inquiry for an agricultural products company:

Customer Name: ${name}
Subject: ${subject}
Message: ${message}

Company Details:
- Company Name: Hydrorich
- Phone: 9322810348
- Business: Agricultural products and solutions

Guidelines:
- Be professional and friendly
- Address their specific concerns
- Include relevant information about our agricultural solutions
- Keep it concise and clear
- Focus on agricultural expertise and product knowledge
- Mention our commitment to quality agricultural products
- Include our contact information for further assistance
    `;

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error("AI response generation error:", error);
    return `Dear ${name},

Thank you for contacting Hydrorich. We've received your message and will get back to you shortly.

Best regards,
The Hydrorich Team`;
  }
}

export const submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // 1. Validate input
    const errors = validateContactInput({ name, email, subject, message });
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    // 2. Generate AI response using Gemini
    const aiResponse = await generateAIResponse(name, subject, message);

    // 3. Send email to admin
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
        ${
          aiResponse
            ? `
          <h3>AI-Generated Response Sent to User:</h3>
          <p>${aiResponse}</p>
        `
            : ""
        }
      `,
    };
    await transporter.sendMail(mailOptions);

    // 4. Send AI-generated auto-reply to the user
    const userMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Re: ${subject} | Hydrorich Support`,
      html: `
        <p>Dear ${name},</p>
        <p>Thank you for reaching out to Hydrorich.</p>
        <p>Here’s our response based on your inquiry:</p>
        <blockquote style="border-left: 4px solid #ccc; padding-left: 10px; color: #333;">
          ${aiResponse}
        </blockquote>
        <p>If you have further questions, feel free to reply to this email.</p>
        <br>
        <p>Best regards,</p>
        <p>The Hydrorich Team</p>
      `,
    };
    await transporter.sendMail(userMailOptions);

    // 5. Final success response
    return res.status(200).json({
      success: true,
      message: "Message sent successfully",
      aiResponse: aiResponse || null,
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send message. Please try again later.",
    });
  }
};

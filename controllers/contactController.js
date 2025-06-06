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
    const model = genAI.getGenerativeModel({ model: "models/gemini-pro" });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Write a professional response to this customer inquiry for a water purification company:

Customer Name: ${name}
Subject: ${subject}
Message: ${message}

Guidelines:
- Be professional and friendly
- Address their specific concerns
- Include relevant information about water purification
- Keep it concise and clear`,
            },
          ],
        },
      ],
    });

    const response = await result.response;
    const text = await response.text();
    return text;
  } catch (error) {
    console.error("AI response generation error:", error);
    return `Dear ${name},

Thank you for contacting Hydrorich. We’ve received your message and will get back to you shortly.

Best regards,
The Hydrorich Team`;
  }
}



export const submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate input
    const errors = validateContactInput({ name, email, subject, message });
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    // Generate AI response
    const aiResponse = await generateAIResponse(name, subject, message);

    // Prepare email content for admin
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
        <h3>AI-Generated Response:</h3>
        <p>${aiResponse}</p>
        `
            : ""
        }
      `,
    };

    // Send email to admin
    await transporter.sendMail(mailOptions);

    // Send response email to user
    const userMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Thank you for contacting Hydrorich",
      html: `
        <h2>Thank you for contacting us!</h2>
        <p>Dear ${name},</p>
        <p>We have received your message and will get back to you as soon as possible.</p>
        <p>Here's a copy of your message:</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
        ${
          aiResponse
            ? `
        <h3>Initial Response:</h3>
        <p>${aiResponse}</p>
        `
            : ""
        }
        <br>
        <p>Best regards,</p>
        <p>The Hydrorich Team</p>
      `,
    };

    await transporter.sendMail(userMailOptions);

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

import React, { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const Contact = () => {
  const form = useRef();
  const [isSent, setIsSent] = useState(false);
  const navigate=useNavigate();
  const sendEmail = (e) => {
    e.preventDefault();
    emailjs
      .sendForm(
        "service_p2dgjta",
        "template_ccygm5u",
        form.current,
        "dgh4GvZCpo3PH79MB"
      )
      .then(
        () => {
          setIsSent(true);
          form.current.reset();
          toast.success("Message sent successfully! ✅", {
            position: "top-right",
            autoClose: 3000,
            theme: "dark",
          });
          navigate("/chat-page")
        },
        (error) => {
          console.error("Error sending message:", error);
          toast.error("Failed to send message. Please try again.", {
            position: "top-right",
            autoClose: 3000,
            theme: "dark",
          });
        }
      );
  };

  return (
    <section
      id="contact"
      className="flex flex-col items-center justify-center py-20 px-6 sm:px-12 lg:px-32 bg-gradient-to-b from-[#0f0c29] via-[#302b63] to-[#24243e] min-h-screen"
    >
      <ToastContainer />

      {/* Heading */}
      <div className="text-center mb-12">
        <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500 drop-shadow-lg">
          Contact Us
        </h2>
        <div className="w-24 h-1 bg-pink-500 mx-auto mt-3 rounded-full animate-pulse"></div>
        <p className="text-gray-300 mt-5 text-lg max-w-xl mx-auto">
          Got a question or need help? Fill out the form below and we’ll get back to you.
        </p>
      </div>

      {/* Contact Form */}
      <div className="w-full max-w-xl bg-white/10 backdrop-blur-lg p-8 sm:p-10 rounded-2xl shadow-2xl border border-purple-700/40">
        <h3 className="text-2xl font-semibold text-white text-center mb-8">
          Get In Touch <span className="ml-1 animate-bounce">📩</span>
        </h3>

        <form ref={form} onSubmit={sendEmail} className="flex flex-col space-y-6">
          <input
            type="email"
            name="user_email"
            placeholder="Your Email"
            required
            className="w-full p-3 rounded-lg bg-[#241a3e]/80 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-300"
          />
          <input
            type="text"
            name="user_name"
            placeholder="Your Name"
            required
            className="w-full p-3 rounded-lg bg-[#241a3e]/80 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-300"
          />
          <input
            type="text"
            name="subject"
            placeholder="Subject"
            required
            className="w-full p-3 rounded-lg bg-[#241a3e]/80 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-300"
          />
          <textarea
            name="message"
            placeholder="Submit Your Issue"
            rows="5"
            required
            className="w-full p-3 rounded-lg bg-[#241a3e]/80 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-300 resize-none"
          />

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 py-3 text-white font-bold rounded-lg hover:scale-105 hover:shadow-lg hover:shadow-pink-500/40 transition-all duration-300"
          >
            {isSent ? "✅ Sent" : "Send Message 🚀"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Contact;

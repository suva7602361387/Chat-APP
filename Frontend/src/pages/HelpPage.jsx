import React, { useState } from "react";
import { ChevronDown, ChevronUp, LifeBuoy } from "lucide-react";
import { useNavigate } from "react-router-dom";

const faqs = [
  {
    question: "How do I create an account?",
    answer:
      "Click on the Sign Up button, fill in your details (name, email, password), and verify your email to activate your account.",
  },
  {
    question: "How do I start a chat?",
    answer:
      "Go to the Contacts section, select a user, and click on their profile to start chatting.",
  },
  {
    question: "How do I update my profile?",
    answer:
      "Go to Settings → Profile, where you can update your name, about info, and upload a new profile picture.",
  },
  {
    question: "Why can’t I see new messages after refreshing?",
    answer:
      "Your messages are stored in the database. If you don’t see them, check your internet connection or refresh again. If the issue continues, log out and log in again.",
  },
  {
    question: "How do I know if someone is online?",
    answer:
      "Online users have a green indicator next to their name. If they are offline, you will see their last seen time.",
  },
  {
    question: "How do I report a problem?",
    answer:
      "Go to Settings → Help & Support → Contact Support, and submit your issue. Our support team will assist you.",
  },
];

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState(null);
  const navigate = useNavigate();

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handlePage = () => {
    navigate("/help-page-contact-page");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 mt-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 drop-shadow-lg">
          Help & FAQ
        </h1>
        <p className="text-gray-600 mt-2">
          Find answers to common questions or contact our support team.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className={`border rounded-xl shadow-md transition-all duration-300 p-5 bg-white/90 backdrop-blur-sm ${
              openIndex === index ? "border-blue-500" : "border-gray-200"
            }`}
            onClick={() => toggleFAQ(index)}
          >
            <div className="flex justify-between items-center cursor-pointer">
              <h2 className="text-lg font-semibold text-gray-800">
                {faq.question}
              </h2>
              {openIndex === index ? (
                <ChevronUp className="w-5 h-5 text-blue-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </div>
            {openIndex === index && (
              <p className="mt-3 text-gray-600 leading-relaxed">{faq.answer}</p>
            )}
          </div>
        ))}
      </div>

      {/* Contact Support */}
      <div className="mt-12 text-center">
        <button
          onClick={handlePage}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full shadow-lg transition-all duration-300"
        >
          <LifeBuoy className="w-5 h-5" />
          Contact Support
        </button>
      </div>
    </div>
  );
}

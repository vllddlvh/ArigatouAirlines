// components/Footer.js
import {
  MdPhone,
  MdOutlineMailOutline,
  MdOutlineLocationOn,
} from "react-icons/md";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-br from-blue-950 to-black text-white">
      {/* Section 1 - Features */}
      <div className="w-full px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[
            { icon: "plane", text: "200+ Destinations" },
            { icon: "clock", text: "24/7 Support" },
            { icon: "shield", text: "Safe Travel" },
            { icon: "heart", text: "Best Experience" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center text-center p-6 bg-white/5 rounded-2xl 
              hover:bg-white/10 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
            >
              <i
                className={`lucide lucide-${item.icon} mb-2 text-blue-500`}
                style={{ fontSize: "28px" }}
              ></i>
              <span className="text-sm text-white font-medium mt-2">
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-white/10 w-full" />

      {/* Section 2 - Footer content */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto py-16 px-6">
        {/* Logo + Social */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-plane text-blue-500"
            >
              <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"></path>
            </svg>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-white bg-clip-text text-transparent">
              Q Airlines
            </h3>
          </div>
          <p className="text-blue-100 opacity-80">Elevating Your Journey</p>

          <div className="flex space-x-3">
            {["facebook", "twitter", "instagram"].map((icon, idx) => (
              <button
                key={idx}
                className="group inline-flex items-center justify-center w-10 h-10 rounded-full 
                bg-white/10 hover:bg-white/20 text-white transition-all"
              >
                <i className={`lucide lucide-${icon}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-semibold mb-4 text-blue-300">Quick Links</h4>
          <nav className="flex flex-col space-y-2">
            {["Book Flight", "Check-in", "Flight Status", "Destinations"].map(
              (link, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="text-white/70 hover:text-white hover:pl-2 transition-all duration-300"
                >
                  {link}
                </a>
              )
            )}
          </nav>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-semibold mb-4 text-blue-300">Contact</h4>
          <div className="space-y-3 text-white/70">
            <div className="flex items-center gap-3 hover:text-white transition-colors">
              <MdPhone className="text-blue-500" />
              <span>1-800-FLY-QAIR</span>
            </div>
            <div className="flex items-center gap-3 hover:text-white transition-colors">
              <MdOutlineMailOutline className="text-blue-500" />
              <span>contact@qairlines.com</span>
            </div>
            <div className="flex items-center gap-3 hover:text-white transition-colors">
              <MdOutlineLocationOn className="text-blue-500" />
              <span>Main Terminal, Airport City</span>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="font-semibold mb-4 text-blue-300">Newsletter</h4>
          <p className="text-white/70 mb-4">Subscribe for exclusive offers</p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-3 py-2 rounded-md bg-white/10 border border-white/10 
              text-white placeholder-blue-100/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="button"
              className="px-4 py-2 rounded-md bg-gradient-to-r from-blue-500 to-blue-700 
              text-white font-semibold hover:opacity-90 transition"
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>

      <div className="h-px bg-white/10 w-full" />

      {/* Footer bottom */}
      <div className="max-w-6xl mx-auto py-6 px-6 text-center text-white/50">
        <p>© 2025 Q Airlines. All rights reserved.</p>
      </div>
    </footer>
  );
}

import Link from "next/link";
import Image from "next/image";
import { FiLinkedin, FiTwitter, FiFacebook } from "react-icons/fi";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Solutions", href: "/#solutions" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
];

const services = [
  "Payment Processing",
  "Fee Analysis",
  "Merchant Solutions",
  "Charitable Giving",
];

const socialLinks = [
  { icon: FiLinkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: FiTwitter, href: "https://x.com", label: "X (Twitter)" },
  { icon: FiFacebook, href: "https://facebook.com", label: "Facebook" },
];

export default function Footer() {
  return (
    <footer className="bg-dark text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2">
              <Image
                src="/GenPayLogo.png"
                alt="Generosity Pays"
                width={52}
                height={52}
                className="h-13 w-13 object-contain"
                style={{ filter: "brightness(0) invert(1)" }}
              />
              <h3 className="text-2xl font-bold text-white">Generosity Pays</h3>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-gray-400">
              Premium payment processing with purpose. Every transaction
              supports charitable causes that make a difference — at no
              additional cost to your business.
            </p>
            <div className="mt-6 flex gap-4">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-gray-400 transition-colors hover:bg-primary hover:text-dark"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white">Quick Links</h4>
            <ul className="mt-4 space-y-3">
              {quickLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-gray-400 transition-colors hover:text-primary"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold text-white">Services</h4>
            <ul className="mt-4 space-y-3">
              {services.map((service) => (
                <li key={service}>
                  <span className="text-sm text-gray-400">{service}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold text-white">Contact</h4>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href="mailto:hello@generositypays.net"
                  className="text-sm text-gray-400 transition-colors hover:text-primary"
                >
                  hello@generositypays.net
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-muted">
            &copy; 2025 Generosity Pays. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

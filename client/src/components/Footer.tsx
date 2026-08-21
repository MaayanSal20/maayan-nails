function Footer() {
  return (
    <footer className="bg-wine text-white py-10 px-6 text-center font-sans">
      <p className="font-serif text-2xl mb-2">Maayan Nails</p>

      <a
        href="https://instagram.com/maayan_nails33"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-white/80 hover:text-pink transition-colors mb-3"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <circle
            cx="17.5"
            cy="6.5"
            r="1"
            fill="currentColor"
            stroke="none"
          />
        </svg>

        <span className="text-sm">עקבו אחרינו באינסטגרם</span>
      </a>

      <p className="text-white/60 text-sm">© 2026 כל הזכויות שמורות</p>
    </footer>
  );
}

export default Footer;
function Contact() {
  return (
    <section id="contact" className="py-20 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-4xl font-serif text-wine mb-4">
          בואי נקבע תור
        </h2>

        <p className="text-lg text-wine/80 mb-10">
          נשמח לראות אותך בסטודיו – השאירי פרטים או צרי קשר ישירות
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
          <a
            href="https://wa.me/972500000000"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-rose text-cream px-8 py-3 rounded-full font-sans text-lg hover:bg-wine transition-colors"
          >
            שליחת הודעה בוואטסאפ
          </a>

          <a
            href="tel:0500000000"
            className="border-2 border-rose text-wine px-8 py-3 rounded-full font-sans text-lg hover:bg-blush transition-colors"
          >
            התקשרי עכשיו
          </a>
        </div>

        <div className="mt-10 w-full rounded-2xl overflow-hidden border border-pink/30">
          <iframe
            src="https://www.google.com/maps?q=תל אביב&output=embed"
            width="100%"
            height="300"
            style={{ border: 0 }}
            loading="lazy"
            title="מיקום הסטודיו"
          ></iframe>
        </div>
      </div>
    </section>
  );
}

export default Contact;


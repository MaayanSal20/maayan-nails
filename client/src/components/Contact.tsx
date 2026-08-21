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
            href="https://wa.me/97255771992"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-rose text-cream px-8 py-3 rounded-full font-sans text-lg hover:bg-wine transition-colors"
          >
            שליחת הודעה בוואטסאפ
          </a>

          <a
            href="tel:0557721992"
            className="border-2 border-rose text-wine px-8 py-3 rounded-full font-sans text-lg hover:bg-blush transition-colors"
          >
            התקשרי עכשיו
          </a>
        </div>

        <div className="mt-10 w-full rounded-2xl overflow-hidden border border-pink/30">
          <iframe
            src="https://www.google.com/maps/embed?pb=!4v1787331268618!6m8!1m7!1sCqqObsp6ucE84lcmzIhz8A!2m2!1d32.8800042464508!2d35.43251062710003!3f78.70321227698042!4f2.6386687797147346!5f0.7820865974627469https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d1675.3440638065429!2d35.43389961139892!3d32.8799701100534!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1siw!2sil!4v1787331809920!5m2!1siw!2sil"
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


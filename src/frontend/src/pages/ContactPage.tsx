export default function ContactPage() {
  return (
    <div className="min-h-screen py-16 md:py-24 flex items-center justify-center">
      <div
        style={{
          background: '#000',
          color: '#fff',
          padding: '60px 30px',
          borderRadius: 16,
          maxWidth: 900,
          margin: '0 auto',
        }}
      >
        <h2 style={{ color: '#D4AF37', fontSize: 36, marginBottom: 10 }}>
          Contact Elvra Worldwide
        </h2>

        <p style={{ opacity: 0.8, marginBottom: 30 }}>
          Have a project in mind? Get premium designs delivered in just 3 days.
        </p>

        <div style={{ display: 'grid', gap: 20 }}>
          {/* EMAIL */}
          <a
            href="mailto:elvraworldwide@gmail.com"
            className="contact-card"
            style={{
              textDecoration: 'none',
              background: '#111',
              padding: 20,
              borderRadius: 12,
              color: '#fff',
              border: '1px solid #222',
              transition: 'transform 0.2s ease-in-out',
              display: 'block',
            }}
          >
            📧 Email Us <br />
            <span style={{ color: '#D4AF37' }}>elvraworldwide@gmail.com</span>
          </a>

          {/* WHATSAPP */}
          <a
            href="https://wa.me/919211459550"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-card"
            style={{
              textDecoration: 'none',
              background: '#111',
              padding: 20,
              borderRadius: 12,
              color: '#fff',
              border: '1px solid #222',
              transition: 'transform 0.2s ease-in-out',
              display: 'block',
            }}
          >
            📱 WhatsApp Us <br />
            <span style={{ color: '#25D366' }}>+91 9211459550</span>
          </a>
        </div>

        <p style={{ marginTop: 40, fontSize: 14, opacity: 0.6 }}>
          © Elvra Worldwide — Designing Brands Worldwide
        </p>

        <style>{`
          .contact-card:hover {
            transform: scale(1.03);
          }
        `}</style>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import axios from "axios";
import API from "../config";
import "./Template1.css";

export default function Template1({ eventDetails }) {
  const { groomName, brideName, date, weddingData, _id } = eventDetails;
  
  // Default fallbacks in case admin hasn't set data yet
  const wd = weddingData || {};
  const heroImage = wd.heroImage || "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1920&q=80";
  const story = wd.story || "We met when we least expected it, and couldn't imagine life without each other. Join us as we celebrate the beginning of our forever.";
  const gallery = wd.gallery || [
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=800&q=80"
  ];
  const schedule = wd.schedule || [
    { time: "2:00 PM", title: "Wedding Ceremony", desc: "Main Hall" },
    { time: "4:30 PM", title: "Photo Session & Cocktails", desc: "The Garden" },
    { time: "6:00 PM", title: "Dinner & Reception", desc: "Grand Ballroom" }
  ];
  const mapUrl = wd.mapUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.064502597401!2d-122.39203858468205!3d37.78853117975705!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085807afb7222df%3A0xc6fb09ec0ae66114!2sWedding%20Venue!5e0!3m2!1sen!2sus!4v1614050000000!5m2!1sen!2sus";
  const telegramBot = wd.telegramBot || "";

  // Form State
  const [rsvpData, setRsvpData] = useState({ name: "", phone: "", attending: "true", guestCount: 1, message: "" });
  const [rsvpStatus, setRsvpStatus] = useState(null);

  const handleRsvp = async (e) => {
    e.preventDefault();
    setRsvpStatus("loading");
    try {
      await axios.post(`${API}/api/rsvp/${_id}`, {
        ...rsvpData,
        attending: rsvpData.attending === "true"
      });
      setRsvpStatus("success");
    } catch (error) {
      console.error(error);
      setRsvpStatus("error");
    }
  };

  const formattedDate = new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="template1-wrapper">
      {/* Hero Section */}
      <section className="t1-hero" style={{ backgroundImage: `url(${heroImage})` }}>
        <div className="t1-hero-overlay"></div>
        <div className="t1-hero-content animate-down">
          <h1 className="t1-title">{groomName} & {brideName}</h1>
          <p className="t1-subtitle animate-up">Are getting married • {formattedDate}</p>
        </div>
      </section>

      {/* Love Story */}
      <section className="t1-section t1-story">
        <h2>Our Story</h2>
        <p>{story}</p>
      </section>

      {/* Gallery */}
      {gallery.length > 0 && (
        <section className="t1-section" style={{ backgroundColor: "#fff" }}>
          <h2>Moments</h2>
          <div className="t1-gallery-grid">
            {gallery.map((imgUrl, i) => (
              <img key={i} src={imgUrl} alt="Wedding moment" className="t1-gallery-img" />
            ))}
          </div>
        </section>
      )}

      {/* Schedule */}
      {schedule.length > 0 && (
        <section className="t1-section">
          <h2>Schedule</h2>
          <div className="t1-schedule-list">
            {schedule.map((item, i) => (
              <div key={i} className="t1-schedule-item">
                <div className="t1-schedule-time">{item.time}</div>
                <h3 style={{ margin: "0 0 0.5rem 0", color: "#333" }}>{item.title}</h3>
                <p style={{ margin: 0, color: "#777" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Location */}
      <section className="t1-section" style={{ backgroundColor: "#fff" }}>
        <h2>Location</h2>
        <div className="t1-map-container">
          <iframe 
            src={mapUrl} 
            allowFullScreen="" 
            loading="lazy"
            title="Wedding Location"
          ></iframe>
        </div>
        {telegramBot && (
          <div style={{ textAlign: "center" }}>
            <a href={telegramBot} target="_blank" rel="noopener noreferrer" className="t1-telegram-btn">
              🔔 Join our Telegram Bot for Updates
            </a>
          </div>
        )}
      </section>

      {/* RSVP Section */}
      <section className="t1-section">
        <h2>RSVP</h2>
        {rsvpStatus === "success" ? (
          <div style={{ padding: "3rem", background: "#d4edda", color: "#155724", borderRadius: "8px", maxWidth: "500px", margin: "0 auto" }}>
            <h3>Thank you!</h3>
            <p>Your response has been successfully recorded.</p>
          </div>
        ) : (
          <form className="t1-rsvp-form" onSubmit={handleRsvp}>
            <div className="t1-input-group">
              <label>Full Name</label>
              <input required type="text" className="t1-input" value={rsvpData.name} onChange={e => setRsvpData({...rsvpData, name: e.target.value})} placeholder="Jane Doe" />
            </div>
            
            <div className="t1-input-group">
              <label>Phone Number (Optional)</label>
              <input type="text" className="t1-input" value={rsvpData.phone} onChange={e => setRsvpData({...rsvpData, phone: e.target.value})} placeholder="+1 234 567 8900" />
            </div>

            <div className="t1-input-group">
              <label>Will you attend?</label>
              <select className="t1-select" value={rsvpData.attending} onChange={e => setRsvpData({...rsvpData, attending: e.target.value})}>
                <option value="true">Joyfully Accept</option>
                <option value="false">Regretfully Decline</option>
              </select>
            </div>

            {rsvpData.attending === "true" && (
              <div className="t1-input-group">
                <label>Number of Guests</label>
                <input type="number" min="1" max="10" className="t1-input" value={rsvpData.guestCount} onChange={e => setRsvpData({...rsvpData, guestCount: e.target.value})} />
              </div>
            )}

            <div className="t1-input-group">
              <label>Message to the Couple (Optional)</label>
              <textarea className="t1-textarea" rows="4" value={rsvpData.message} onChange={e => setRsvpData({...rsvpData, message: e.target.value})} placeholder="Can't wait to celebrate!"></textarea>
            </div>

            <button type="submit" className="t1-btn" disabled={rsvpStatus === "loading"}>
              {rsvpStatus === "loading" ? "Submitting..." : "Send RSVP"}
            </button>
            {rsvpStatus === "error" && <p style={{color: "red", marginTop: "1rem"}}>Something went wrong. Please try again.</p>}
          </form>
        )}
      </section>

      {/* Footer */}
      <footer style={{ background: "#2c3e50", color: "#aaa", textAlign: "center", padding: "2rem" }}>
        <p>© {new Date().getFullYear()} {groomName} & {brideName}. Designed with ❤️</p>
      </footer>
    </div>
  );
}

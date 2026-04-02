import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import API from "./config";

export default function WebsiteEditor() {
  const { eventId } = useParams();
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [isPublished, setIsPublished] = useState(false);
  const [heroImage, setHeroImage] = useState("");
  const [story, setStory] = useState("");
  const [galleryText, setGalleryText] = useState("");
  const [mapUrl, setMapUrl] = useState("");
  const [telegramBot, setTelegramBot] = useState("");

  const fetchEvent = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/events/${eventId}`, { withCredentials: true });
      const data = res.data;
      setEventData(data);
      setIsPublished(data.isPublished || false);
      
      const wd = data.weddingData || {};
      setHeroImage(wd.heroImage || "");
      setStory(wd.story || "");
      setGalleryText(wd.gallery ? wd.gallery.join("\\n") : "");
      setMapUrl(wd.mapUrl || "");
      setTelegramBot(wd.telegramBot || "");

    } catch (err) {
      console.error("Error fetching event details", err);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    // Parse gallery URLs from text area
    const galleryArray = galleryText.split("\\n").map(s => s.trim()).filter(s => s.length > 0);

    const weddingData = {
      heroImage,
      story,
      gallery: galleryArray,
      mapUrl,
      telegramBot,
      schedule: eventData?.weddingData?.schedule || [] // Keep existing schedule for now
    };

    try {
      await axios.put(`${API}/api/events/${eventId}`, {
        weddingData,
        isPublished,
        templateId: "Template1" // Default template logic
      }, { withCredentials: true });
      alert("Website updated successfully! 🎉");
    } catch (err) {
      console.error(err);
      alert("Error saving website details.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="app-container" style={{textAlign:"center", marginTop:"50px"}}>Loading...</div>;

  return (
    <div className="app-container" style={{ minHeight: "100vh", paddingBottom: "3rem" }}>
      <div className="top-bar">
        <h1 className="title" style={{ margin: 0 }}>Website Editor 🖥️</h1>
        <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
          <Link to={`/dashboard/${eventId}`} className="btn btn-secondary">
            Back to Dashboard ⬅️
          </Link>
          <a href={`/weddings/${eventData?.slug}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{backgroundColor: "#8b5cf6"}}>
            Preview Live Site 🔗
          </a>
        </div>
      </div>

      <div className="card" style={{ marginTop: "2rem" }}>
        <h2>Customize {eventData?.name}</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
          Fill in the details below to generate the beautiful wedding website.
        </p>

        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "1rem", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <input 
              type="checkbox" 
              id="publishToggle" 
              checked={isPublished} 
              onChange={e => setIsPublished(e.target.checked)} 
              style={{ width: "20px", height: "20px" }}
            />
            <label htmlFor="publishToggle" style={{ fontWeight: "bold", cursor: "pointer" }}>
              Publish Website (Make it visible to guests)
            </label>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>Hero Image URL</label>
            <input 
              className="search-input" 
              value={heroImage} 
              onChange={e => setHeroImage(e.target.value)} 
              placeholder="https://imgur.com/your-image.jpg" 
              style={{ width: "100%" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>Our Story</label>
            <textarea 
              className="search-input" 
              rows="5"
              value={story} 
              onChange={e => setStory(e.target.value)} 
              placeholder="Tell the story of how you met..." 
              style={{ width: "100%", padding: "1rem", borderRadius: "8px", border: "1px solid #ddd" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>Photo Gallery URLs (One per line)</label>
            <textarea 
              className="search-input" 
              rows="4"
              value={galleryText} 
              onChange={e => setGalleryText(e.target.value)} 
              placeholder="https://url1.jpg&#10;https://url2.jpg&#10;https://url3.jpg" 
              style={{ width: "100%", padding: "1rem", borderRadius: "8px", border: "1px solid #ddd", whiteSpace: "pre" }}
            />
          </div>

          <div style={{ display: "flex", gap: "1rem" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>Google Maps Embed URL</label>
              <input 
                className="search-input" 
                value={mapUrl} 
                onChange={e => setMapUrl(e.target.value)} 
                placeholder="https://www.google.com/maps/embed?..." 
                style={{ width: "100%" }}
              />
            </div>
            
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>Telegram Group Link (Optional)</label>
              <input 
                className="search-input" 
                value={telegramBot} 
                onChange={e => setTelegramBot(e.target.value)} 
                placeholder="https://t.me/yourwedding" 
                style={{ width: "100%" }}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-success" style={{ padding: "1rem", fontSize: "1.1rem", marginTop: "1rem" }} disabled={saving}>
            {saving ? "Saving..." : "Save Website Changes 💾"}
          </button>
        </form>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import API from "./config";

export default function TemplateGallery() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [name, setName] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchTemplates = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/api/templates`);
      setTemplates(data);
    } catch (err) {
      console.error("Error fetching templates", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { name, previewImage, externalUrl, description, slug };
    
    try {
      if (editingId) {
        await axios.put(`${API}/api/templates/${editingId}`, payload, { withCredentials: true });
      } else {
        await axios.post(`${API}/api/templates`, payload, { withCredentials: true });
      }
      resetForm();
      fetchTemplates();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save template.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (t) => {
    setEditingId(t._id);
    setName(t.name);
    setPreviewImage(t.previewImage || "");
    setExternalUrl(t.externalUrl);
    setDescription(t.description || "");
    setSlug(t.slug || "");
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this template from the portfolio?")) return;
    try {
      await axios.delete(`${API}/api/templates/${id}`, { withCredentials: true });
      fetchTemplates();
    } catch (err) {
      alert("Failed to delete template.");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setPreviewImage("");
    setExternalUrl("");
    setDescription("");
    setSlug("");
    setShowForm(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image is too large. Please select a file under 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) return <div className="app-container" style={{textAlign:"center", marginTop:"50px"}}>Loading Portfolio...</div>;

  return (
    <div className="app-container" style={{ minHeight: "100vh" }}>
      <div className="top-bar">
        <h1 className="title" style={{ margin: 0 }}>Template Gallery 🖼️</h1>
        <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
          <Link to="/events" className="btn btn-secondary">
            Back ⬅️
          </Link>
          <button onClick={() => { resetForm(); setShowForm(true); }} className="btn btn-success">
            Add New Template ➕
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card" style={{ marginTop: "1rem", border: "2px dashed var(--gold)" }}>
          <h2 style={{ marginTop: 0 }}>{editingId ? "Edit Template" : "Add Template to Portfolio"}</h2>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "0.8rem", color: "var(--text-muted)" }}>Template Name</label>
                <input required className="search-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Royal Gold" />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "0.8rem", color: "var(--text-muted)" }}>External Slug (for internal info)</label>
                <input required className="search-input" value={slug} onChange={e => setSlug(e.target.value)} placeholder="royal-gold" />
              </div>
            </div>
            
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontSize: "0.8rem", color: "var(--text-muted)" }}>External Live URL</label>
              <input required className="search-input" value={externalUrl} onChange={e => setExternalUrl(e.target.value)} placeholder="https://template-site.com" />
            </div>

            <div style={{ display: "flex", gap: "15px", alignItems: "flex-end" }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "0.8rem", color: "var(--text-muted)" }}>Preview Image URL (or upload below)</label>
                <input className="search-input" value={previewImage} onChange={e => setPreviewImage(e.target.value)} placeholder="https://image-host.com/thumb.jpg" />
              </div>
              <div style={{ width: "100px", height: "60px", background: `#222 url(${previewImage || 'https://via.placeholder.com/100x60'}) center/cover`, borderRadius: "8px", border: "1px solid var(--glass-border)" }}></div>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px", fontSize: "0.8rem", color: "var(--gold)" }}>📤 Upload from Local Machine</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileUpload} 
                style={{ 
                  background: "rgba(255,255,255,0.05)", 
                  padding: "10px", 
                  borderRadius: "8px", 
                  width: "100%", 
                  border: "1px solid var(--glass-border)",
                  color: "var(--text-muted)"
                }} 
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px", fontSize: "0.8rem", color: "var(--text-muted)" }}>Brief Description</label>
              <textarea className="search-input" rows="2" value={description} onChange={e => setDescription(e.target.value)} placeholder="Floral aesthetics with minimal transitions..." style={{width: "100%", borderRadius: "8px"}} />
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button type="submit" className="btn btn-success" style={{ flex: 1 }} disabled={saving}>
                {saving ? "Saving..." : (editingId ? "Update Template ✅" : "Save to Portfolio ✅")}
              </button>
              <button type="button" onClick={resetForm} className="btn btn-secondary">
                Cancel ❌
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px", marginTop: "2rem" }}>
        {templates.map(t => (
          <div key={t._id} className="card" style={{ padding: "0", overflow: "hidden", border: "1px solid var(--glass-border)", background: "rgba(255,255,255,0.03)" }}>
            <div style={{ height: "200px", background: `#222 url(${t.previewImage || 'https://via.placeholder.com/300x200?text=No+Preview'}) center/cover` }}></div>
            <div style={{ padding: "1.5rem" }}>
              <h3 style={{ margin: "0 0 0.5rem 0", color: "var(--gold-light)" }}>{t.name}</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "1rem", height: "40px", overflow: "hidden" }}>{t.description || "No description provided."}</p>
              
              <div style={{ display: "flex", gap: "10px" }}>
                <a href={t.externalUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ flex: 1, textAlign: "center", fontSize: "0.8rem", padding: "8px" }}>
                  View Live 🔗
                </a>
                <button onClick={() => handleEdit(t)} className="btn btn-secondary" style={{ fontSize: "0.8rem", padding: "8px" }}>
                  Edit ✏️
                </button>
                <button onClick={() => handleDelete(t._id)} className="btn" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", fontSize: "0.8rem", padding: "8px" }}>
                  Del 🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && !loading && (
        <div style={{ textAlign: "center", padding: "5rem", color: "var(--text-muted)" }}>
          <p>No templates in your portfolio yet. Click "Add New Template" to begin! 🖼️</p>
        </div>
      )}
    </div>
  );
}

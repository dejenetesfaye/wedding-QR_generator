import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import API from "./config";
import Template1 from "./templates/Template1";

export default function TemplateRenderer() {
  const { slug } = useParams();
  const [eventDetails, setEventDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the event using the unique slug
    axios.get(`${API}/api/events/slug/${slug}`)
      .then((res) => {
        setEventDetails(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching wedding info:", err);
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <div style={{ textAlign: "center", padding: "5rem" }}>Loading your beautiful invitation... ✨</div>;
  if (!eventDetails) return <div style={{ textAlign: "center", padding: "5rem", color: "red" }}>Wedding not found ❌</div>;

  // The admin might not have published the website yet
  if (!eventDetails.isPublished) {
    return (
      <div style={{ textAlign: "center", padding: "5rem" }}>
        <h2>Coming Soon! 💍</h2>
        <p>The wedding website for {eventDetails.groomName} & {eventDetails.brideName} is currently being prepared.</p>
      </div>
    );
  }

  // Fallback to Template1 if no templateId provided
  const templateName = eventDetails.templateId?.componentRef || "Template1";

  // Dispatch to the correct template
  switch (templateName) {
    case "Template1":
      return <Template1 eventDetails={eventDetails} />;
    default:
      return <Template1 eventDetails={eventDetails} />;
  }
}

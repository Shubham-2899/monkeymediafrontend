import React, { useState } from "react";
import "./CreateLink.css";
import axios from "axios";

interface CreateLinkProps {}

const CreateLink: React.FC<CreateLinkProps> = () => {
  const [domain, setDomain] = useState<string>("");
  const [offerId, setOfferId] = useState<string>(generateOfferId());
  const [linkPattern, setLinkPattern] = useState<string>(
    generateRandomPattern()
  );
  const [redirectLink, setRedirectLink] = useState<string>("");
  const [generatedLink, setGeneratedLink] = useState<string>("");
  const [linkType, setLinkType] = useState<string>("Subscribe link");
  const [copied, setCopied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false); // New state for loading status

  console.log(setOfferId, setLinkPattern);

  function generateOfferId(): string {
    return Math.random().toString(36).substring(2, 10);
  }

  function generateRandomPattern(): string {
    return `/${Math.random().toString(36).substring(2, 10)}/${Math.random()
      .toString(36)
      .substring(2, 10)}`;
  }

  const handleAddOffer = async () => {
    setLoading(true); // Set loading to true when API call starts
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_API_BASE_URL}/url`,
        {
          url: redirectLink,
          offerId: offerId,
          domain: domain,
          linkPattern: linkPattern,
          linkType: linkType,
        }
      );

      setGeneratedLink(response.data.finalRedirectLink);

      // Log for debugging purposes
      console.log(`Generated Link: ${response.data.finalRedirectLink}`);
    } catch (error) {
      console.error("Error creating offer link:", error);
    } finally {
      setLoading(false); // Set loading to false when API call ends
    }
  };

  const handleCopyToClipboard = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink).then(
        () => {
          console.log("Link copied to clipboard!");
          setCopied(true); // Set copied state to true when the link is copied
          setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
        },
        (err) => {
          console.error("Failed to copy the link: ", err);
        }
      );
    }
  };

  return (
    <div className="container">
      <div className="CreateLink">
        <h1>Create Offer Link</h1>
        <div className="form-group">
          <label>Domain:</label>
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="https://healthcare.info"
          />
        </div>
        <div className="form-group">
          <label>Offer ID:</label>
          <input type="text" value={offerId} readOnly />
        </div>
        <div className="form-group">
          <label>Link Pattern:</label>
          <input type="text" value={linkPattern} readOnly />
        </div>
        <div className="form-group">
          <label>Link Type:</label>
          <select
            value={linkType}
            onChange={(e) => setLinkType(e.target.value)}
            style={{ width: "100%" }}
          >
            <option value="Subscribe link">Subscribe link</option>
            <option value="Unsubscribe link">Unsubscribe link</option>
          </select>
        </div>
        <div className="form-group">
          <label>Redirect Link:</label>
          <input
            type="text"
            value={redirectLink}
            onChange={(e) => setRedirectLink(e.target.value)}
            placeholder="https://www.exampleform.com/sdvdf?sub1=offerid"
          />
        </div>
        <button
          onClick={handleAddOffer}
          className="add-offer-button"
          disabled={loading}
        >
          {loading ? "Generating..." : "Add Offer"}
        </button>
        {generatedLink && (
          <div className="generated-link">
            <h2>Generated Link</h2>
            <textarea readOnly value={generatedLink} />
            <button
              onClick={handleCopyToClipboard}
              className="copy-link-button"
            >
              Copy Link
            </button>
            {copied && <span className="copied-message">Copied!</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateLink;

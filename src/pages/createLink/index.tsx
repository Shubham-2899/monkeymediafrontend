import React, { useState } from "react";
import "./CreateLink.css";
import axios from "axios";

interface CreateLinkProps {}

const CreateLink: React.FC<CreateLinkProps> = () => {
  const [domain, setDomain] = useState<string>("");
  const [offerId, setOfferId] = useState<string>("");
  const [linkPattern, setLinkPattern] = useState<string>("");
  const [redirectLink, setRedirectLink] = useState<string>("");
  const [generatedLink, setGeneratedLink] = useState<string>("");
  const [linkType, setLinkType] = useState<string>("Subscribe link");
  const [campaignId, setCampaignId] = useState<string>("");

  const [copied, setCopied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // function generateOfferId(): string {
  //   return Math.random().toString(36).substring(2, 10);
  // }

  // function generateRandomPattern(): string {
  //   return `/${Math.random().toString(36).substring(2, 10)}/${Math.random()
  //     .toString(36)
  //     .substring(2, 10)}`;
  // }

  const handleAddOffer = async () => {
    setLoading(true); // Set loading to true when API call starts
    try {
      // Retrieve the token from session storage
      const token = sessionStorage.getItem("Auth Token");
      const response = await axios.post(
        `${import.meta.env.VITE_APP_API_BASE_URL}/url`,
        {
          url: redirectLink,
          offerId: offerId,
          domain: domain,
          linkPattern: linkPattern,
          linkType: linkType,
          campaignId: campaignId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
          <label>Campaign ID:</label>
          <input
            type="text"
            value={campaignId}
            onChange={(e) => setCampaignId(e.target.value)}
            placeholder="Affiliate Campaign ID"
          />
        </div>
        <div className="form-group">
          <label>Offer ID:</label>
          <input
            type="text"
            value={offerId}
            onChange={(e) => setOfferId(e.target.value)}
            placeholder="Enter Offer ID"
          />
        </div>
        <div className="form-group">
          <label>Link Pattern:</label>
          <input
            type="text"
            value={linkPattern}
            onChange={(e) => setLinkPattern(e.target.value)}
            placeholder="/abc123/xyz456"
          />
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

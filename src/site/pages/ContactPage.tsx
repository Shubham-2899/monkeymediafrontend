import { FormEvent, useState } from "react";
import { Alert, Box, TextField } from "@mui/material";
import { ArrowIcon, PageHead, SiteShell } from "../SiteParts";
import { CONTACT, CONTACT_PAGE } from "../content";

const MAP_SRC = `https://www.google.com/maps?q=${encodeURIComponent(CONTACT.address)}&output=embed`;

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  // There is no contact API yet, so the form opens the visitor's mail app
  // with everything pre-filled, addressed to the team inbox.
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Website enquiry from ${form.name}`);
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\nContact Number: ${form.phone}\n\n${form.message}`);
    window.location.href = `mailto:${CONTACT.email}?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <SiteShell>
      <PageHead index="03" label="Contact Us" title={CONTACT_PAGE.title} lead={CONTACT_PAGE.intro} />

      <section className="section">
        <div className="wrap contact">
          <div>
            <dl>
              <dt className="label">Address</dt>
              <dd>{CONTACT.address}</dd>
              <dt className="label">Email</dt>
              <dd>
                <a href={`mailto:${CONTACT.email}`} className="inline-link">
                  {CONTACT.email}
                </a>
              </dd>
            </dl>
            <div className="map">
              <iframe title="RASPIX Media office location" src={MAP_SRC} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            </div>
          </div>

          <div>
            <div className="label">Send a message</div>
            {sent && (
              <Alert severity="success" variant="outlined" sx={{ mt: 2, borderRadius: 0 }}>
                Your email app should have opened with your message. If it didn&apos;t, write to us at {CONTACT.email}.
              </Alert>
            )}
            <Box
              component="form"
              onSubmit={submit}
              sx={{
                mt: 1,
                display: "grid",
                gap: 3.5,
                "& .MuiInputLabel-root": { fontFamily: "var(--sans)" },
                "& .MuiInput-root": { fontSize: 18 },
                "& .MuiInput-underline:before": { borderBottomColor: "rgba(20,33,61,0.3)" },
                "& .MuiInput-underline:after": { borderBottomColor: "var(--stamp)" },
              }}
            >
              <Box sx={{ display: "grid", gap: 3.5, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
                <TextField variant="standard" label="Name" required value={form.name} onChange={set("name")} fullWidth />
                <TextField variant="standard" label="Email" type="email" required value={form.email} onChange={set("email")} fullWidth />
              </Box>
              <TextField variant="standard" label="Contact Number" type="tel" required value={form.phone} onChange={set("phone")} fullWidth />
              <TextField variant="standard" label="Message" required multiline minRows={4} value={form.message} onChange={set("message")} fullWidth />
              <div>
                <button type="submit" className="btn btn--ink">
                  Submit <ArrowIcon />
                </button>
              </div>
            </Box>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

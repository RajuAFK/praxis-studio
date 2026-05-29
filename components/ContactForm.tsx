"use client";

import { useState, type FormEvent } from "react";

/**
 * Mailto contact form. No server, no API key — submitting the form composes
 * a pre-filled email in the user's default mail client addressed to
 * `primaryEmail`. Swap to an API route later without changing the markup.
 */
export function ContactForm({ primaryEmail }: { primaryEmail: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const lines = [
      `Name: ${name}`,
      `Reply-to: ${email}`,
      "",
      message,
    ];
    const body = encodeURIComponent(lines.join("\n"));
    const subj = encodeURIComponent(subject || "New enquiry — Praxis Studio");
    window.location.href = `mailto:${primaryEmail}?subject=${subj}&body=${body}`;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6"
      style={{ width: "100%" }}
    >
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
        <Field
          label="Your name"
          value={name}
          onChange={setName}
          required
          autoComplete="name"
        />
        <Field
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          required
          autoComplete="email"
        />
      </div>

      <Field
        label="Subject"
        value={subject}
        onChange={setSubject}
        placeholder="A few words on the project"
      />

      <Field
        label="Message"
        as="textarea"
        value={message}
        onChange={setMessage}
        required
        rows={6}
        placeholder="The site, the subject, the timeline. Anything that helps us picture it."
      />

      <button
        type="submit"
        className="font-mono"
        style={{
          alignSelf: "flex-start",
          background: "transparent",
          border: "1px solid var(--vault-ember)",
          color: "var(--vault-paper)",
          padding: "14px 28px",
          fontSize: 11,
          letterSpacing: "0.22em",
          cursor: "pointer",
          transition: "background 240ms ease, color 240ms ease",
          textTransform: "uppercase",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background =
            "var(--vault-ember)";
          (e.currentTarget as HTMLButtonElement).style.color = "#000";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background =
            "transparent";
          (e.currentTarget as HTMLButtonElement).style.color =
            "var(--vault-paper)";
        }}
      >
        Send enquiry →
      </button>

      <p
        className="font-mono"
        style={{
          fontSize: 10,
          letterSpacing: "0.22em",
          color: "var(--vault-paper-dim)",
          marginTop: 4,
        }}
      >
        Submitting opens your default mail client addressed to{" "}
        <span style={{ color: "var(--vault-paper)" }}>{primaryEmail}</span>
      </p>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  as = "input",
  required,
  rows,
  placeholder,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  as?: "input" | "textarea";
  required?: boolean;
  rows?: number;
  placeholder?: string;
  autoComplete?: string;
}) {
  const sharedStyle: React.CSSProperties = {
    width: "100%",
    background: "transparent",
    border: "none",
    borderBottom: "1px solid var(--vault-rule)",
    color: "var(--vault-paper)",
    fontFamily: "var(--font-display), serif",
    fontWeight: 300,
    fontSize: 18,
    padding: "10px 0",
    outline: "none",
    resize: as === "textarea" ? "vertical" : "none",
    transition: "border-color 240ms ease",
  };

  return (
    <label
      style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}
    >
      <span
        className="font-mono"
        style={{
          fontSize: 10,
          letterSpacing: "0.22em",
          color: "var(--vault-ember)",
        }}
      >
        {label.toUpperCase()}
        {required ? " *" : ""}
      </span>
      {as === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          rows={rows}
          placeholder={placeholder}
          style={sharedStyle}
          onFocus={(e) =>
            (e.currentTarget.style.borderBottomColor = "var(--vault-ember)")
          }
          onBlur={(e) =>
            (e.currentTarget.style.borderBottomColor = "var(--vault-rule)")
          }
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          autoComplete={autoComplete}
          placeholder={placeholder}
          style={sharedStyle}
          onFocus={(e) =>
            (e.currentTarget.style.borderBottomColor = "var(--vault-ember)")
          }
          onBlur={(e) =>
            (e.currentTarget.style.borderBottomColor = "var(--vault-rule)")
          }
        />
      )}
    </label>
  );
}

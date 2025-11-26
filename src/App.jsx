import React, { useState, useEffect } from "react";
import { Send } from "lucide-react";

const WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbzq5u_6wi-zAW3ojl721eDoBn1t915ZnMPNJ5MNeKYe3fcvqzc7Kd3S9VYcwXu7zvNdfw/exec";

export default function App() {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [formData, setFormData] = useState({
    travelType: "",
    name: "",
    phone: "",
    guestCount: 1,
    guestNames: [""],
    coordinatorIndex: 0,
    events: { wedding: false, reception: false },
    travelMode: "",
    arrivalDate: "",
    arrivalTime: "",
    arrivalLocation: "",
    needPickup: false,
    accommodation: "",
    departureDetails: "",
    hardDrinkCount: "0",
  });

  useEffect(() => {
    if (formData.travelType === "solo") {
      setFormData((prev) => ({
        ...prev,
        guestCount: 1,
        guestNames: [prev.name || ""],
        coordinatorIndex: 0,
      }));
    } else if (formData.travelType === "group") {
      setFormData((prev) => {
        const currentNames = [...prev.guestNames];
        const count = parseInt(prev.guestCount, 10);
        const newNames = Array(count)
          .fill("")
          .map((_, i) => currentNames[i] || "");
        if (newNames[0] === "" && prev.name) newNames[0] = prev.name;
        return { ...prev, guestNames: newNames };
      });
    }
  }, [formData.guestCount, formData.name, formData.travelType]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  const handleGuestNameChange = (index, value) => {
    const newNames = [...formData.guestNames];
    newNames[index] = value;
    setFormData((prev) => ({ ...prev, guestNames: newNames }));
  };
  const toggleEvent = (event) => {
    setFormData((prev) => ({
      ...prev,
      events: { ...prev.events, [event]: !prev.events[event] },
    }));
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const isStepValid = () => {
    if (step === 0) return true;
    if (step === 1)
      return formData.travelType === "solo" || formData.travelType === "group";
    if (step === 2)
      return (
        formData.name &&
        formData.phone &&
        /^\d{10}$/.test(formData.phone) &&
        (formData.travelType === "group" ? formData.guestCount >= 1 : true)
      );
    if (step === 3) {
      if (formData.travelType === "group") {
        const allNamesFilled = formData.guestNames.every(
          (name) => name.trim() !== ""
        );
        return allNamesFilled && formData.coordinatorIndex !== null;
      } else {
        return true;
      }
    }
    if (
      (step === 4 && formData.travelType === "group") ||
      (step === 3 && formData.travelType === "solo")
    ) {
      return formData.events.wedding || formData.events.reception;
    }
    if (
      (step === 5 && formData.travelType === "group") ||
      (step === 4 && formData.travelType === "solo")
    ) {
      if (!formData.travelMode) return false;
      if (formData.travelMode !== "personal") {
        return formData.arrivalDate && formData.arrivalLocation;
      }
      return true;
    }
    if (
      (step === 6 && formData.travelType === "group") ||
      (step === 5 && formData.travelType === "solo")
    ) {
      return formData.accommodation !== "";
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!isStepValid()) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch(WEB_APP_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.result === "success") setStep(7);
      else setSubmitError("Something went wrong, please try again.");
    } catch (err) {
      setSubmitError("Network error, please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fdfbf7",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100vw",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 650,
          background: "#23232e",
          padding: "36px 0 36px 0",
          color: "#fff",
          borderRadius: "0 0 38px 38px",
          boxShadow: "0 3px 24px #0002",
          textAlign: "center",
          marginBottom: 32,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            fontFamily: "serif",
            fontWeight: 700,
            fontSize: 42,
            color: "#fff",
            letterSpacing: "2px",
          }}
        >
          KK Wedding RSVP
        </div>
        <div
          style={{
            color: "#ffe07a",
            letterSpacing: "4px",
            fontWeight: 600,
            margin: "9px auto 0",
            fontSize: 21,
          }}
        >
          CELEBRATION & LOGISTICS
        </div>
      </div>
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          background: "#fff",
          borderRadius: 24,
          boxShadow: "0 2px 12px #0002",
          padding: window.innerWidth < 600 ? "18px 8px 18px 8px" : 40,
          textAlign: "left",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxSizing: "border-box",
        }}
      >
        {/* Progress Bar */}
        {step > 0 && (
          <div
            style={{
              height: 6,
              background: "#ffeecb",
              borderRadius: 3,
              marginBottom: 32,
              width: "100%",
            }}
          >
            <div
              style={{
                height: "100%",
                background: "#ffbb33",
                width: `${(step / 7) * 100}%`,
                transition: "width 0.4s",
              }}
            />
          </div>
        )}

        {/* Step 0: Intro */}
        {step === 0 && (
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontFamily: "serif",
                fontWeight: 500,
                fontSize: 32,
                marginBottom: 18,
                color: "#2e2e2e",
              }}
            >
              Dear Family & Friends
            </div>
            <p
              style={{
                fontSize: 18,
                margin: "14px 0 24px",
                color: "#23232e",
              }}
            >
              We are counting down the days to celebrate with you!
            </p>
            <div
              style={{
                background: "#fffbe6",
                borderRadius: 14,
                padding: 20,
                margin: "20px 0",
                color: "#835900",
                fontSize: 15,
                textAlign: "left",
              }}
            >
              <div>
                To ensure your experience at the <b>Wedding and Reception</b> is
                seamless, please spare a moment to share your travel details.
              </div>
              <div
                style={{
                  fontWeight: "bold",
                  margin: "18px 0 8px 0",
                  color: "#835900",
                }}
              >
                RSVP Deadline: 28th Nov (Midnight)
              </div>
              <div>
                Please fill this form by the 28th so we can finalize logistics
                and provide the best service for you.
              </div>
              <div
                style={{
                  marginTop: 12,
                  paddingTop: 12,
                  borderTop: "1px solid #ffeeb6",
                }}
              >
                <div style={{ fontWeight: "bold" }}>A Humble Request</div>
                For responses received after the deadline or last-minute plans,{" "}
                <span style={{ fontWeight: "bold" }}>
                  we seek your kind support.
                </span>
                While we will do our best, pre-arrangements for accommodation
                and transport might be limited due to late confirmation.
              </div>
            </div>
            <button
              onClick={nextStep}
              style={{
                background: "#23232e",
                color: "#fff",
                borderRadius: 12,
                padding: "16px 0",
                width: "100%",
                fontSize: 18,
                marginTop: 16,
                border: 0,
              }}
            >
              I Understand, Let's Start &nbsp;
              <Send size={20} />
            </button>
          </div>
        )}

        {/* Step 1: Solo/group choice */}
        {step === 1 && (
          <div style={{ width: "100%", textAlign: "center" }}>
            <div
              style={{
                fontFamily: "serif",
                fontWeight: 500,
                fontSize: 32,
                marginBottom: 18,
                textAlign: "center",
                color: "#2e2e2e",
              }}
            >
              Are you traveling alone or with a group?
            </div>
            <button
              style={{
                width: "100%",
                padding: "16px 0",
                fontSize: 18,
                borderRadius: 12,
                marginBottom: 12,
                border:
                  formData.travelType === "solo"
                    ? "2px solid #ffbb33"
                    : "2px solid #ccc",
                background: "#fff",
                color: "#23232e",
                cursor: "pointer",
              }}
              onClick={() => {
                setFormData((prev) => ({
                  ...prev,
                  travelType: "solo",
                  guestCount: 1,
                  guestNames: [prev.name || ""],
                  coordinatorIndex: 0,
                }));
              }}
            >
              Just Me
              <div style={{ fontSize: 12, color: "#8a8a8a", fontWeight: 400 }}>
                I am filling this form only for myself.
              </div>
            </button>
            <button
              style={{
                width: "100%",
                padding: "16px 0",
                fontSize: 18,
                borderRadius: 12,
                marginBottom: 12,
                border:
                  formData.travelType === "group"
                    ? "2px solid #ffbb33"
                    : "2px solid #ccc",
                background:
                  formData.travelType === "group" ? "#fffbe6" : "#fff",
                color: "#23232e",
                cursor: "pointer",
              }}
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  travelType: "group",
                }))
              }
            >
              I'm with a Group / Family
              <div style={{ fontSize: 12, color: "#8a8a8a", fontWeight: 400 }}>
                I am filling this for multiple people.
              </div>
            </button>
            {formData.travelType === "group" && (
              <div
                style={{
                  background: "#fff1f0",
                  color: "#b0413e",
                  padding: 12,
                  borderRadius: 8,
                  marginTop: 12,
                  fontSize: 15,
                  border: "1px solid #fcbbb6",
                }}
              >
                <b>Important:</b> To avoid double-booking, please ensure{" "}
                <b>no one else</b> from your group is filling this form. You
                will be the single point of contact (Coordinator) for your
                group.
              </div>
            )}
          </div>
        )}

        {/* Step 2: Contact details */}
        {step === 2 && (
          <div style={{ width: "100%" }}>
            <div
              style={{
                fontFamily: "serif",
                fontWeight: 500,
                fontSize: 32,
                marginBottom: 18,
                textAlign: "center",
                color: "#2e2e2e",
              }}
            >
              Your Contact Details
            </div>
            <form>
              <div style={{ marginBottom: 18 }}>
                <label
                  style={{
                    color: "#23232e",
                    background: "#fff",
                    fontWeight: 600,
                  }}
                >
                  Name:
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: 10,
                    borderRadius: 7,
                    border: "1px solid #ccc",
                    background: "#fff",
                    color: "#23232e",
                    fontSize: 18,
                  }}
                  required
                />
              </div>
              <div style={{ marginBottom: 18 }}>
                <label
                  style={{
                    color: "#23232e",
                    background: "#fff",
                    fontWeight: 600,
                  }}
                >
                  Phone:
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    handleInputChange(
                      "phone",
                      e.target.value.replace(/\D/g, "")
                    )
                  }
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: 10,
                    borderRadius: 7,
                    border: "1px solid #ccc",
                    background: "#fff",
                    color: "#23232e",
                    fontSize: 18,
                  }}
                  maxLength={10}
                  minLength={10}
                  pattern="\d{10}"
                  required
                />
                {formData.phone.length > 0 && formData.phone.length !== 10 && (
                  <div style={{ color: "#e44", marginTop: 6 }}>
                    Please enter a valid 10-digit phone number.
                  </div>
                )}
              </div>
              {formData.travelType === "group" && (
                <div style={{ marginBottom: 18 }}>
                  <label
                    style={{
                      color: "#23232e",
                      background: "#fff",
                      fontWeight: 600,
                    }}
                  >
                    Total Members (Including You):
                  </label>
                  <select
                    value={formData.guestCount}
                    onChange={(e) =>
                      handleInputChange("guestCount", e.target.value)
                    }
                    style={{
                      width: "100%",
                      marginTop: 6,
                      padding: 10,
                      borderRadius: 7,
                      border: "1px solid #ccc",
                      background: "#fff",
                      color: "#23232e",
                      fontSize: 18,
                    }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? "Person" : "People"}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </form>
          </div>
        )}

        {/* Step 3: Guest details (group) */}
        {step === 3 && formData.travelType === "group" && (
          <div style={{ width: "100%" }}>
            <div
              style={{
                fontFamily: "serif",
                fontWeight: 500,
                fontSize: 32,
                marginBottom: 18,
                textAlign: "center",
                color: "#2e2e2e",
              }}
            >
              Who is traveling?
            </div>
            <div
              style={{
                textAlign: "center",
                marginBottom: 15,
                color: "#23232e",
              }}
            >
              Please list names and <b>tick the Coordinator</b>.
            </div>
            <div style={{ marginTop: 8 }}>
              {formData.guestNames.map((name, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 13,
                    background: "#fffbe9",
                    borderRadius: 8,
                    border:
                      formData.coordinatorIndex === idx
                        ? "2px solid #ffbb33"
                        : "1px solid #ddd",
                    padding: "8px 12px",
                  }}
                >
                  <input
                    type="text"
                    value={name}
                    placeholder={`Guest ${idx + 1}`}
                    onChange={(e) => handleGuestNameChange(idx, e.target.value)}
                    style={{
                      flex: 1,
                      marginRight: 12,
                      padding: 8,
                      borderRadius: 6,
                      border: "1px solid #ccc",
                      background: "#fff",
                      color: "#23232e",
                      fontSize: 16,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleInputChange("coordinatorIndex", idx)}
                    style={{
                      background:
                        formData.coordinatorIndex === idx ? "#ffbb33" : "#eee",
                      color: "#835900",
                      marginLeft: 2,
                      border: "none",
                      borderRadius: 19,
                      width: 28,
                      height: 28,
                      textAlign: "center",
                    }}
                  >
                    {formData.coordinatorIndex === idx ? "✓" : ""}
                  </button>
                  <span
                    style={{
                      fontSize: 11,
                      marginLeft: 4,
                      color:
                        formData.coordinatorIndex === idx ? "#c4950c" : "#999",
                      background: "#fff",
                    }}
                  >
                    Coordinator
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Events Attending */}
        {(step === 4 && formData.travelType === "group") ||
        (step === 3 && formData.travelType === "solo") ? (
          <div style={{ width: "100%" }}>
            <div
              style={{
                fontFamily: "serif",
                fontWeight: 500,
                fontSize: 32,
                marginBottom: 18,
                textAlign: "center",
                color: "#2e2e2e",
              }}
            >
              Events Attending
            </div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 16,
                background: formData.events.wedding ? "#ffeecb" : "#fafafa",
                borderRadius: 7,
                border: "2px solid #ffd466",
                padding: "18px 10px",
                color: "#23232e",
              }}
            >
              <input
                type="checkbox"
                checked={formData.events.wedding}
                onChange={() => toggleEvent("wedding")}
                style={{ marginTop: 0 }}
              />
              <span style={{ marginLeft: 12 }}>
                The Wedding (Baraat)
                <div style={{ fontSize: 13, color: "#ffbb33", marginTop: 3 }}>
                  Nov 30th • Sehore
                </div>
              </span>
            </label>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 10,
                background: formData.events.reception ? "#ffeecb" : "#fafafa",
                borderRadius: 7,
                border: "2px solid #ffd466",
                padding: "18px 10px",
                color: "#23232e",
              }}
            >
              <input
                type="checkbox"
                checked={formData.events.reception}
                onChange={() => toggleEvent("reception")}
                style={{ marginTop: 0 }}
              />
              <span style={{ marginLeft: 12 }}>
                Reception
                <div style={{ fontSize: 13, color: "#ffbb33", marginTop: 3 }}>
                  Dec 2nd • Bhopal
                </div>
              </span>
            </label>
          </div>
        ) : null}

        {/* Step 5: Travel Details */}
        {(step === 5 && formData.travelType === "group") ||
        (step === 4 && formData.travelType === "solo") ? (
          <div style={{ width: "100%" }}>
            <div
              style={{
                fontFamily: "serif",
                fontWeight: 500,
                fontSize: 32,
                marginBottom: 18,
                textAlign: "center",
                color: "#2e2e2e",
              }}
            >
              Travel Details
            </div>
            <div style={{ display: "flex", gap: 9, marginBottom: 18 }}>
              {[
                { id: "personal", label: "My Vehicle" },
                { id: "train", label: "Train" },
                { id: "flight", label: "Flight" },
                { id: "bus", label: "Bus" },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => handleInputChange("travelMode", mode.id)}
                  style={{
                    flex: 1,
                    padding: 12,
                    borderRadius: 9,
                    border:
                      formData.travelMode === mode.id
                        ? "2px solid #ffbb33"
                        : "2px solid #ccc",
                    background:
                      formData.travelMode === mode.id ? "#ffeecb" : "#f7f7f7",
                    color: "#23232e",
                  }}
                >
                  {mode.label}
                </button>
              ))}
            </div>
            {formData.travelMode === "personal" && (
              <div
                style={{
                  background: "#d6f7e6",
                  color: "#099758",
                  border: "1px solid #b0eabb",
                  borderRadius: 8,
                  padding: 13,
                  marginTop: 10,
                  fontSize: 15,
                }}
              >
                Drive directly to <b>Sehore Venue</b> on the 30th.
                <br />
                Location details will be sent to coordinator{" "}
                <b>
                  {formData.guestNames[formData.coordinatorIndex] &&
                  formData.travelType === "group"
                    ? formData.guestNames[formData.coordinatorIndex]
                    : formData.name || "you"}
                </b>
                .
              </div>
            )}
            {(formData.travelMode === "train" ||
              formData.travelMode === "flight" ||
              formData.travelMode === "bus") && (
              <div style={{ marginTop: 12 }}>
                <input
                  type="date"
                  value={formData.arrivalDate}
                  onChange={(e) =>
                    handleInputChange("arrivalDate", e.target.value)
                  }
                  style={{
                    width: "49%",
                    marginRight: "2%",
                    borderRadius: 6,
                    padding: 8,
                    border: "1px solid #ccc",
                    background: "#fff",
                    color: "#23232e",
                  }}
                />
                <input
                  type="time"
                  value={formData.arrivalTime}
                  onChange={(e) =>
                    handleInputChange("arrivalTime", e.target.value)
                  }
                  style={{
                    width: "49%",
                    borderRadius: 6,
                    padding: 8,
                    border: "1px solid #ccc",
                    background: "#fff",
                    color: "#23232e",
                  }}
                />
                <select
                  value={formData.arrivalLocation}
                  onChange={(e) =>
                    handleInputChange("arrivalLocation", e.target.value)
                  }
                  style={{
                    margin: "10px 0 6px 0",
                    width: "100%",
                    borderRadius: 6,
                    padding: 8,
                    border: "1px solid #ccc",
                    background: "#fff",
                    color: "#23232e",
                  }}
                >
                  <option value="">Select Arrival Point...</option>
                  <option value="Bhopal Airport">Bhopal Airport</option>
                  <option value="Rani Kamlapati Station">
                    Rani Kamlapati Station
                  </option>
                  <option value="Bhopal Junction">Bhopal Junction</option>
                  <option value="Nadra Bus Stand">Bus Stand</option>
                </select>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    margin: "7px 0",
                    background: "#fff6d9",
                    borderRadius: 7,
                    padding: 9,
                    border: "1px solid #ffd466",
                    color: "#23232e",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.needPickup}
                    onChange={(e) =>
                      handleInputChange("needPickup", e.target.checked)
                    }
                    style={{ marginRight: 8 }}
                  />
                  We need pickup support
                </label>
              </div>
            )}
          </div>
        ) : null}

        {/* Step 6/5: Preferences & Stay + Party Fuel & Spirits + Navigation */}
        {(step === 6 && formData.travelType === "group") ||
        (step === 5 && formData.travelType === "solo") ? (
          <div style={{ width: "100%" }}>
            <div
              style={{
                fontFamily: "serif",
                fontWeight: 500,
                fontSize: 32,
                marginBottom: 18,
                textAlign: "center",
                color: "#2e2e2e",
              }}
            >
              Preferences & Stay
            </div>
            <div
              style={{
                fontWeight: 700,
                marginBottom: 14,
                fontSize: 16,
                color: "#222",
              }}
            >
              DO YOU NEED ACCOMMODATION?
            </div>
            {[
              "Yes (30th Nov - 2nd Dec)",
              "Sehore only (30th Nov)",
              "Bhopal only (2nd Dec)",
              "No, own arrangements",
            ].map((option) => (
              <label
                key={option}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: 10,
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  marginBottom: 9,
                  color: "#2e2e2e",
                  background: "#fff",
                  fontWeight: 500,
                }}
              >
                <input
                  type="radio"
                  name="accommodation"
                  value={option}
                  checked={formData.accommodation === option}
                  onChange={(e) =>
                    handleInputChange("accommodation", e.target.value)
                  }
                  style={{ marginRight: 14 }}
                />
                {option}
              </label>
            ))}
            {/* PARTY FUEL & SPIRITS SECTION */}
            <div
              style={{
                marginTop: "28px",
                marginBottom: "18px",
                background: "#f8edff",
                borderRadius: 12,
                border: "1.5px solid #debcfa",
                padding: "18px 16px",
                boxShadow: "0 2px 8px #e6baff1a",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                <span
                  style={{ color: "#b676ec", fontSize: 22, marginRight: 7 }}
                >
                  🎉
                </span>
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: 15,
                    color: "#301e44",
                  }}
                >
                  Party Fuel & Spirits
                </span>
                <span style={{ marginLeft: 7, fontSize: 18 }}>🥂</span>
              </div>
              <div
                style={{
                  color: "#6c507c",
                  fontSize: 14,
                  marginBottom: 8,
                }}
              >
                To keep the spirits high, we plan to provide 'Party Kits'
                directly to your rooms/groups.
              </div>
              <div
                style={{
                  background: "#f5e4ff",
                  borderRadius: 10,
                  border: "1px solid #e4c7f5",
                  padding: "16px",
                  marginBottom: "2px",
                }}
              >
                <label
                  style={{
                    fontWeight: "bold",
                    fontSize: 15,
                    color: "#682bb0",
                    marginBottom: 7,
                    display: "block",
                  }}
                >
                  How many in your group enjoy hard drinks?
                </label>
                <select
                  value={formData.hardDrinkCount}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      hardDrinkCount: e.target.value,
                    }))
                  }
                  style={{
                    width: "100%",
                    fontSize: 16,
                    border: "2px solid #debcfa",
                    borderRadius: 8,
                    padding: "11px 10px",
                    background: "#f8edff",
                    color: "#682bb0",
                    marginBottom: 5,
                  }}
                >
                  <option value="0">0 (Non-Alcoholic Group)</option>
                  <option value="1">1 Person</option>
                  <option value="2">2 People</option>
                  <option value="3">3 People</option>
                  <option value="4">4 People</option>
                  <option value="5+">5+ People</option>
                </select>
                <div
                  style={{
                    color: "#a085b4",
                    fontSize: 13,
                    marginTop: 3,
                  }}
                >
                  *This helps us stock your designated area accordingly!
                </div>
              </div>
            </div>
            {submitError && (
              <div style={{ color: "#e44", marginTop: 10 }}>{submitError}</div>
            )}
            {/* Navigation Buttons: Show "Back" and "Submit" */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 30,
                width: "100%",
              }}
            >
              <button
                onClick={prevStep}
                style={{
                  background: "#eee",
                  borderRadius: 10,
                  color: "#736900",
                  fontWeight: "bold",
                  border: "none",
                  padding: "12px 28px",
                  fontSize: 16,
                }}
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !isStepValid()}
                style={{
                  background: "#23232e",
                  borderRadius: 22,
                  color: "#fff",
                  fontWeight: "bold",
                  border: "none",
                  padding: "13px 35px",
                  fontSize: 17,
                  boxShadow: "0 0 6px #ffd83344",
                  opacity: submitting || !isStepValid() ? 0.6 : 1,
                }}
              >
                {submitting ? (
                  "Submitting..."
                ) : (
                  <>
                    Submit <Send size={17} />
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          // Navigation Buttons for All Other Steps
          step > 0 &&
          step < 7 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 30,
                width: "100%",
              }}
            >
              <button
                onClick={prevStep}
                style={{
                  background: "#eee",
                  borderRadius: 10,
                  color: "#736900",
                  fontWeight: "bold",
                  border: "none",
                  padding: "12px 28px",
                  fontSize: 16,
                }}
              >
                Back
              </button>
              <button
                onClick={nextStep}
                disabled={!isStepValid()}
                style={{
                  background: "#23232e",
                  borderRadius: 22,
                  color: "#fff",
                  fontWeight: "bold",
                  border: "none",
                  padding: "13px 35px",
                  fontSize: 17,
                  boxShadow: "0 0 6px #ffd83344",
                  opacity: !isStepValid() ? 0.6 : 1,
                }}
              >
                Next <Send size={17} />
              </button>
            </div>
          )
        )}

        {/* Success */}
        {step === 7 && (
          <div style={{ textAlign: "center", padding: "40px 8px" }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "#d6f7e6",
                margin: "0 auto 15px",
                fontSize: 45,
                paddingTop: 10,
                color: "#099758",
              }}
            >
              ♥
            </div>
            <div
              style={{
                fontFamily: "serif",
                fontWeight: 500,
                fontSize: 32,
                marginBottom: 18,
                textAlign: "center",
                color: "#2e2e2e",
              }}
            >
              You're All Set!
            </div>
            <div
              style={{
                fontSize: 18,
                margin: "12px 0",
                color: "#23232e",
              }}
            >
              We have noted that{" "}
              <b>
                {formData.travelType === "group"
                  ? formData.guestNames[formData.coordinatorIndex]
                  : formData.name}
              </b>{" "}
              is the coordinator.
            </div>
            <div style={{ fontSize: 15, color: "#777" }}>
              Details will be sent shortly. Can't wait to celebrate!
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

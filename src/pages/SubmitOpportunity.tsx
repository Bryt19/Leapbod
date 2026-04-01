import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import "./Landing.css";
import { HiPlus, HiX, HiInformationCircle } from "react-icons/hi";

interface FormData {
  title: string;
  description: string;
  category: string;
  deadline: string;
  location: string;
  organization: string;
  application_url: string;
  requirements: string[];
  benefits: string[];
}

const initialFormData: FormData = {
  title: "",
  description: "",
  category: "internship",
  deadline: "",
  location: "",
  organization: "",
  application_url: "",
  requirements: [""],
  benefits: [""],
};

export default function SubmitOpportunity() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [
    { value: "internship", label: "Internship", icon: "🚀" },
    { value: "scholarship", label: "Scholarship", icon: "🎓" },
    { value: "grant", label: "Grant", icon: "💰" },
    { value: "competition", label: "Competition", icon: "🏆" },
    { value: "event", label: "Event", icon: "🎪" },
    { value: "job", label: "Job", icon: "🏢" },
    { value: "research", label: "Research", icon: "🧪" },
    { value: "fellowship", label: "Fellowship", icon: "🔬" },
  ];

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleArrayFieldChange = (field: "requirements" | "benefits", index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const addArrayField = (field: "requirements" | "benefits") => {
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], ""] }));
  };

  const removeArrayField = (field: "requirements" | "benefits", index: number) => {
    if (formData[field].length > 1) {
      setFormData((prev) => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim()) { newErrors.description = "Description is required"; } 
    else if (formData.description.length < 50) { newErrors.description = "Description must be at least 50 characters"; }
    if (!formData.organization.trim()) newErrors.organization = "Organization is required";
    if (formData.application_url && !isValidUrl(formData.application_url)) newErrors.application_url = "Please enter a valid URL";
    
    if (formData.deadline) {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      if (new Date(formData.deadline) < today) newErrors.deadline = "Deadline cannot be in the past";
    }

    const validRequirements = formData.requirements.filter((req) => req.trim());
    if (validRequirements.length === 0) newErrors.requirements = "At least one requirement is needed";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try { new URL(url); return true; } catch { return false; }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) { window.scrollTo(0, 0); return; }
    if (!user) {
      setErrors((prev) => ({ ...prev, general: "You must be logged in to submit an opportunity" })); return;
    }

    setLoading(true);
    try {
      const cleanReqs = formData.requirements.filter(r => r.trim());
      const cleanBens = formData.benefits.filter(b => b.trim());

      const submissionData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
        location: formData.location.trim() || null,
        organization: formData.organization.trim(),
        application_url: formData.application_url.trim() || null,
        requirements: cleanReqs,
        benefits: cleanBens.length > 0 ? cleanBens : null,
        submitted_by: user.id,
        status: "pending",
        views_count: 0,
        applications_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error: insertError } = await supabase.from("opportunities").insert([submissionData]);
      if (insertError) throw insertError;

      navigate("/dashboard?submitted=true");
    } catch (error: any) {
      setErrors((prev) => ({ ...prev, general: error.message || "Failed to submit. Please try again." }));
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-page" style={{ minHeight: '100vh', background: 'var(--lb-paper)', display: 'flex', flexDirection: 'column' }}>
      <Navigation />

      <div style={{ flex: 1, maxWidth: '800px', width: '100%', margin: '0 auto', padding: '100px 20px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '40px' }} className="reveal visible">
          <div className="sec-eye" style={{ background: 'var(--lb-ink)', color: 'var(--lb-paper)', padding: '6px 16px', borderRadius: '32px', display: 'inline-block', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, marginBottom: '24px' }}>Submit an Opportunity</div>
          <h1 className="hero-h1" style={{ fontSize: '48px', lineHeight: 1.1, marginBottom: '16px' }}>Share the<br />next big thing</h1>
          <p className="hero-sub" style={{ fontSize: '18px', margin: '0 auto', maxWidth: '500px' }}>Help the community grow by sharing internships, jobs, events, and other opportunities.</p>
        </div>

        {errors.general && (
          <div style={{ background: '#ff3366', color: 'white', padding: '16px', borderRadius: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HiInformationCircle size={20} /> {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ background: 'var(--lb-card)', padding: '40px', borderRadius: '32px', boxShadow: 'var(--lb-shadow-lg)', border: '1px solid var(--lb-border)' }}>
          
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: 700, marginBottom: '24px', borderBottom: '1px solid var(--lb-border)', paddingBottom: '16px' }}>Basic Details</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '48px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>Opportunity Title *</label>
              <input 
                className="s-input" 
                style={{ width: '100%', border: errors.title ? '1px solid #ff3366' : '1px solid var(--lb-border)', background: 'var(--lb-paper)', padding: '16px', borderRadius: '16px' }}
                value={formData.title} 
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="e.g., Google Summer Internship 2024"
              />
              {errors.title && <div style={{ color: '#ff3366', fontSize: '12px', marginTop: '6px' }}>{errors.title}</div>}
            </div>

            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 300px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>Category *</label>
                <select 
                  className="s-select"
                  style={{ width: '100%', border: '1px solid var(--lb-border)', background: 'var(--lb-paper)', padding: '16px', borderRadius: '16px' }}
                  value={formData.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                >
                  {categories.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
                </select>
              </div>

              <div style={{ flex: '1 1 300px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>Organization *</label>
                <input 
                  className="s-input" 
                  style={{ width: '100%', border: errors.organization ? '1px solid #ff3366' : '1px solid var(--lb-border)', background: 'var(--lb-paper)', padding: '16px', borderRadius: '16px' }}
                  value={formData.organization}
                  onChange={(e) => handleInputChange("organization", e.target.value)}
                  placeholder="e.g., Google, Mozilla"
                />
                {errors.organization && <div style={{ color: '#ff3366', fontSize: '12px', marginTop: '6px' }}>{errors.organization}</div>}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>Description *</label>
              <textarea 
                style={{ width: '100%', border: errors.description ? '1px solid #ff3366' : '1px solid var(--lb-border)', background: 'var(--lb-paper)', padding: '16px', borderRadius: '16px', minHeight: '160px', fontFamily: 'inherit' }}
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Provide a detailed description of the opportunity..."
              />
              {errors.description && <div style={{ color: '#ff3366', fontSize: '12px', marginTop: '6px' }}>{errors.description}</div>}
            </div>
          </div>

          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: 700, marginBottom: '24px', borderBottom: '1px solid var(--lb-border)', paddingBottom: '16px' }}>Logistics</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '48px' }}>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 300px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>Location</label>
                <input 
                  className="s-input" 
                  style={{ width: '100%', border: '1px solid var(--lb-border)', background: 'var(--lb-paper)', padding: '16px', borderRadius: '16px' }}
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="e.g., Remote, Lagos, London"
                />
              </div>

              <div style={{ flex: '1 1 300px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>Deadline</label>
                <input 
                  type="date"
                  style={{ width: '100%', border: errors.deadline ? '1px solid #ff3366' : '1px solid var(--lb-border)', background: 'var(--lb-paper)', padding: '16px', borderRadius: '16px', outline: 'none', fontFamily: 'inherit' }}
                  value={formData.deadline}
                  onChange={(e) => handleInputChange("deadline", e.target.value)}
                />
                {errors.deadline && <div style={{ color: '#ff3366', fontSize: '12px', marginTop: '6px' }}>{errors.deadline}</div>}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>Application URL</label>
              <input 
                type="url"
                className="s-input" 
                style={{ width: '100%', border: errors.application_url ? '1px solid #ff3366' : '1px solid var(--lb-border)', background: 'var(--lb-paper)', padding: '16px', borderRadius: '16px' }}
                value={formData.application_url}
                onChange={(e) => handleInputChange("application_url", e.target.value)}
                placeholder="https://company.com/apply"
              />
              {errors.application_url && <div style={{ color: '#ff3366', fontSize: '12px', marginTop: '6px' }}>{errors.application_url}</div>}
            </div>
          </div>

          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: 700, marginBottom: '24px', borderBottom: '1px solid var(--lb-border)', paddingBottom: '16px' }}>Lists</h2>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>Requirements *</label>
              {formData.requirements.map((req, index) => (
                <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <input style={{ flex: 1, border: '1px solid var(--lb-border)', background: 'var(--lb-paper)', padding: '12px 16px', borderRadius: '12px' }} value={req} onChange={(e) => handleArrayFieldChange("requirements", index, e.target.value)} placeholder={`Requirement ${index + 1}`} />
                  <button type="button" onClick={() => removeArrayField("requirements", index)} disabled={formData.requirements.length === 1} style={{ padding: '0 16px', borderRadius: '12px', border: '1px solid var(--lb-border)', background: 'var(--lb-paper)', cursor: 'pointer' }}><HiX /></button>
                </div>
              ))}
              <button type="button" onClick={() => addArrayField("requirements")} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: 'var(--lb-blue)', fontWeight: 600, cursor: 'pointer', outline: 'none' }}><HiPlus /> Add Requirement</button>
              {errors.requirements && <div style={{ color: '#ff3366', fontSize: '12px', marginTop: '6px' }}>{errors.requirements}</div>}
            </div>

            <div style={{ marginBottom: '48px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>Benefits (Optional)</label>
              {formData.benefits.map((ben, index) => (
                <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <input style={{ flex: 1, border: '1px solid var(--lb-border)', background: 'var(--lb-paper)', padding: '12px 16px', borderRadius: '12px' }} value={ben} onChange={(e) => handleArrayFieldChange("benefits", index, e.target.value)} placeholder={`Benefit ${index + 1}`} />
                  <button type="button" onClick={() => removeArrayField("benefits", index)} disabled={formData.benefits.length === 1} style={{ padding: '0 16px', borderRadius: '12px', border: '1px solid var(--lb-border)', background: 'var(--lb-paper)', cursor: 'pointer' }}><HiX /></button>
                </div>
              ))}
              <button type="button" onClick={() => addArrayField("benefits")} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: 'var(--lb-blue)', fontWeight: 600, cursor: 'pointer', outline: 'none' }}><HiPlus /> Add Benefit</button>
            </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', paddingTop: '24px', borderTop: '1px solid var(--lb-border)' }}>
            <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-accent" style={{ border: 'none' }}>
              {loading ? "Submitting..." : "Submit for Review →"}
            </button>
          </div>

        </form>
      </div>

      <Footer />
    </div>
  );
}

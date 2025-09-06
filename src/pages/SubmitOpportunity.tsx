import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiPlus, HiX, HiInformationCircle } from "react-icons/hi";
import Navigation from "../components/Navigation";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Calendar } from "../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface FormData {
  title: string;
  description: string;
  category: string;
  deadline: Date | undefined;
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
  deadline: undefined,
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
    { value: "internship", label: "Internship", icon: "💼" },
    { value: "scholarship", label: "Scholarship", icon: "🎓" },
    { value: "competition", label: "Competition", icon: "🏆" },
    { value: "event", label: "Event", icon: "📅" },
    { value: "job", label: "Job", icon: "💼" },
    { value: "research", label: "Research", icon: "🔬" },
  ];

  const handleInputChange = (
    field: keyof FormData,
    value: string | Date | undefined
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleArrayFieldChange = (
    field: "requirements" | "benefits",
    index: number,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const addArrayField = (field: "requirements" | "benefits") => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const removeArrayField = (
    field: "requirements" | "benefits",
    index: number
  ) => {
    if (formData[field].length > 1) {
      setFormData((prev) => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index),
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length < 50) {
      newErrors.description = "Description must be at least 50 characters";
    }

    if (!formData.organization.trim()) {
      newErrors.organization = "Organization is required";
    }

    if (formData.application_url && !isValidUrl(formData.application_url)) {
      newErrors.application_url = "Please enter a valid URL";
    }

    if (formData.deadline) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (formData.deadline < today) {
        newErrors.deadline = "Deadline cannot be in the past";
      }
    }

    const validRequirements = formData.requirements.filter((req) => req.trim());
    if (validRequirements.length === 0) {
      newErrors.requirements = "At least one requirement is needed";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      window.scrollTo(0, 0);
      return;
    }

    if (!user) {
      setErrors((prev) => ({
        ...prev,
        general: "You must be logged in to submit an opportunity",
      }));
      return;
    }

    setLoading(true);
    try {
      const cleanRequirements = formData.requirements.filter((req) =>
        req.trim()
      );
      const cleanBenefits = formData.benefits.filter((benefit) =>
        benefit.trim()
      );

      const submissionData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        deadline: formData.deadline
          ? formData.deadline.toISOString().split("T")[0]
          : null,
        location: formData.location.trim() || null,
        organization: formData.organization.trim(),
        application_url: formData.application_url.trim() || null,
        requirements: cleanRequirements,
        benefits: cleanBenefits.length > 0 ? cleanBenefits : null,
        submitted_by: user.id,
        status: "pending",
        views_count: 0,
        applications_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error: insertError } = await supabase
        .from("opportunities")
        .insert([submissionData]);

      if (insertError) {
        throw insertError;
      }

      navigate("/opportunities", {
        state: {
          message:
            "Opportunity submitted successfully! It will be reviewed by our team.",
          type: "success",
        },
      });
    } catch (error) {
      console.error("Error submitting opportunity:", error);

      let errorMessage = "Failed to submit opportunity. Please try again.";
      if (error && typeof error === "object" && "message" in error) {
        errorMessage = (error as { message: string }).message;
      }

      setErrors((prev) => ({
        ...prev,
        general: errorMessage,
      }));

      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = categories.find(
    (cat) => cat.value === formData.category
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Submit an Opportunity
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Share an amazing opportunity with the community. Help fellow
            students discover their next big break.
          </p>
        </div>

        {/* Info Banner */}
        <Card className="mb-8 border-blue-200 bg-blue-50/50">
          <CardContent className="p-6">
            <div className="flex">
              <HiInformationCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-900 mb-2">
                  Submission Guidelines
                </h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">✅ Accurate information</Badge>
                    <Badge variant="secondary">📝 Clear requirements</Badge>
                    <Badge variant="secondary">👥 Reviewed by team</Badge>
                    <Badge variant="secondary">🔔 Status notifications</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {errors.general && (
            <div className="bg-destructive/15 border border-destructive text-destructive px-4 py-3 rounded-lg">
              <p className="flex items-center gap-2">
                <HiInformationCircle className="h-5 w-5" />
                {errors.general}
              </p>
            </div>
          )}

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Basic Information</CardTitle>
              <CardDescription>
                Tell us about the opportunity and who's offering it
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Opportunity Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="e.g., Google Summer Internship 2024"
                  className={errors.title ? "border-destructive" : ""}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title}</p>
                )}
              </div>

              {/* Category and Organization */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      handleInputChange("category", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category">
                        {selectedCategory && (
                          <span className="flex items-center gap-2">
                            <span>{selectedCategory.icon}</span>
                            <span>{selectedCategory.label}</span>
                          </span>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          <span className="flex items-center gap-2">
                            <span>{category.icon}</span>
                            <span>{category.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organization">Organization *</Label>
                  <Input
                    id="organization"
                    value={formData.organization}
                    onChange={(e) =>
                      handleInputChange("organization", e.target.value)
                    }
                    placeholder="e.g., Google, Microsoft, Stanford University"
                    className={errors.organization ? "border-destructive" : ""}
                  />
                  {errors.organization && (
                    <p className="text-sm text-destructive">
                      {errors.organization}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  rows={5}
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Provide a detailed description of the opportunity, what it involves, and what makes it special..."
                  className={errors.description ? "border-destructive" : ""}
                />
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    {formData.description.length} characters (minimum 50)
                  </p>
                  {formData.description.length >= 50 && (
                    <Badge
                      variant="secondary"
                      className="text-green-700 bg-green-100"
                    >
                      ✓ Good length
                    </Badge>
                  )}
                </div>
                {errors.description && (
                  <p className="text-sm text-destructive">
                    {errors.description}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Additional Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Additional Details</CardTitle>
              <CardDescription>
                Help students understand the logistics and timeline
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Location and Deadline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    placeholder="e.g., Remote, San Francisco, CA"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Application Deadline</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${
                          !formData.deadline && "text-muted-foreground"
                        } ${errors.deadline ? "border-destructive" : ""}`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.deadline
                          ? format(formData.deadline, "PPP")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.deadline}
                        onSelect={(date) => handleInputChange("deadline", date)}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.deadline && (
                    <p className="text-sm text-destructive">
                      {errors.deadline}
                    </p>
                  )}
                </div>
              </div>

              {/* Application URL */}
              <div className="space-y-2">
                <Label htmlFor="application_url">Application URL</Label>
                <Input
                  id="application_url"
                  type="url"
                  value={formData.application_url}
                  onChange={(e) =>
                    handleInputChange("application_url", e.target.value)
                  }
                  placeholder="https://company.com/apply"
                  className={errors.application_url ? "border-destructive" : ""}
                />
                {errors.application_url && (
                  <p className="text-sm text-destructive">
                    {errors.application_url}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Requirements *</CardTitle>
              <CardDescription>
                List what applicants need to qualify for this opportunity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.requirements.map((requirement, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={requirement}
                    onChange={(e) =>
                      handleArrayFieldChange(
                        "requirements",
                        index,
                        e.target.value
                      )
                    }
                    placeholder={`Requirement ${index + 1}`}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeArrayField("requirements", index)}
                    disabled={formData.requirements.length === 1}
                    className="px-3"
                  >
                    <HiX className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addArrayField("requirements")}
                className="w-full"
              >
                <HiPlus className="w-4 h-4 mr-2" />
                Add Requirement
              </Button>
              {errors.requirements && (
                <p className="text-sm text-destructive">
                  {errors.requirements}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                Benefits{" "}
                <span className="text-muted-foreground font-normal">
                  (Optional)
                </span>
              </CardTitle>
              <CardDescription>
                What will participants gain from this opportunity?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.benefits.map((benefit, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={benefit}
                    onChange={(e) =>
                      handleArrayFieldChange("benefits", index, e.target.value)
                    }
                    placeholder={`Benefit ${index + 1}`}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeArrayField("benefits", index)}
                    disabled={formData.benefits.length === 1}
                    className="px-3"
                  >
                    <HiX className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addArrayField("benefits")}
                className="w-full"
              >
                <HiPlus className="w-4 h-4 mr-2" />
                Add Benefit
              </Button>
            </CardContent>
          </Card>

          {/* Submit Section */}
          <Card>
            <CardContent className="pt-6">
              {errors.submit && (
                <div className="mb-4 p-4 bg-destructive/15 border border-destructive/20 rounded-md">
                  <p className="text-destructive">{errors.submit}</p>
                </div>
              )}

              <Separator className="mb-6" />

              <div className="flex flex-col sm:flex-row justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="sm:w-auto"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="sm:w-auto">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Submitting...
                    </>
                  ) : (
                    "Submit for Review"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}

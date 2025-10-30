import { useState, useEffect } from "react";
import Navigation from "../components/Navigation";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Textarea } from "../components/ui/textarea";
import { getCache, setCache } from "../lib/utils";
import {
  HiSearch,
  HiCheck,
  HiX,
  HiTrash,
  HiUser,
  HiDocumentText,
  HiClock,
  HiEye,
  HiPencil,
} from "react-icons/hi";
import { format } from "date-fns";
import type { Database } from "../types/database.types";

type Opportunity = Database["public"]["Tables"]["opportunities"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

type DetailItem = Profile | Opportunity;

type DialogMode = "view" | "edit" | "delete";

const isProfile = (item: DetailItem | null): item is Profile => {
  return item !== null && "role" in item;
};

const isOpportunity = (item: DetailItem | null): item is Opportunity => {
  return item !== null && "category" in item;
};

interface DashboardStats {
  totalUsers: number;
  totalOpportunities: number;
  pendingOpportunities: number;
  totalApplications: number;
}

export default function AdminPanel() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [selectedItem, setSelectedItem] = useState<DetailItem | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>("view");
  const [editForm, setEditForm] = useState<Partial<Opportunity>>({});
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalOpportunities: 0,
    pendingOpportunities: 0,
    totalApplications: 0,
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [opportunityFilter, setOpportunityFilter] = useState("all");

  useEffect(() => {
    // Only fetch what's needed for the initial tab (overview stats)
    fetchStats();
    // Hydrate caches for other tabs to speed up first render
    const profCache = getCache<Profile[]>("admin:profiles:v1");
    if (profCache) setProfiles(profCache);
    const oppCache = getCache<Opportunity[]>("admin:opps:v1");
    if (oppCache) setOpportunities(oppCache);
  }, []);

  // Lazy fetch per tab
  useEffect(() => {
    if (activeTab === "users") {
      fetchProfiles();
    } else if (activeTab === "opportunities") {
      fetchOpportunities();
    }
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const [
        { count: totalUsers },
        { count: totalOpportunities },
        { count: pendingOpportunities },
        { count: totalApplications },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase
          .from("opportunities")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("opportunities")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase
          .from("applications")
          .select("*", { count: "exact", head: true }),
      ]);

      setStats({
        totalUsers: totalUsers || 0,
        totalOpportunities: totalOpportunities || 0,
        pendingOpportunities: pendingOpportunities || 0,
        totalApplications: totalApplications || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, role, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
      if (data) setCache("admin:profiles:v1", data, 120_000);
    } catch (error) {
      console.error("Error fetching profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("opportunities")
        .select("id, title, organization, category, status, created_at")
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) throw error;
      setOpportunities(data || []);
      if (data) setCache("admin:opps:v1", data, 120_000);
    } catch (error) {
      console.error("Error fetching opportunities:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (
    userId: string,
    newRole: "admin" | "student"
  ) => {
    setUpdating(userId);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);

      if (error) throw error;

      await fetchProfiles();
    } catch (error) {
      console.error("Error updating user role:", error);
    } finally {
      setUpdating(null);
    }
  };

  const updateOpportunityStatus = async (
    opportunityId: string,
    newStatus: "approved" | "rejected"
  ) => {
    setUpdating(opportunityId);
    try {
      const { error } = await supabase
        .from("opportunities")
        .update({ status: newStatus })
        .eq("id", opportunityId);

      if (error) throw error;

      // Create notification for the submitter
      const opportunity = opportunities.find((opp) => opp.id === opportunityId);
      if (opportunity?.submitted_by) {
        await supabase.from("notifications").insert({
          user_id: opportunity.submitted_by,
          title: `Opportunity ${newStatus}`,
          message: `Your opportunity "${opportunity.title}" has been ${newStatus}.`,
          type: `opportunity_${newStatus}`,
          related_opportunity_id: opportunityId,
        });
      }

      // Clear public caches so approved opportunities appear immediately
      localStorage.removeItem("opportunities:v1");
      localStorage.removeItem("featured:v1");
      await fetchOpportunities();
    } catch (error) {
      console.error("Error updating opportunity status:", error);
      alert(error instanceof Error ? error.message : "Failed to update opportunity status");
    } finally {
      setUpdating(null);
    }
  };

  const handleViewDetails = async (item: DetailItem) => {
    // For opportunities, fetch full row before showing details to avoid selecting * upfront
    if (isOpportunity(item)) {
      try {
        const { data, error } = await supabase
          .from("opportunities")
          .select("*")
          .eq("id", item.id)
          .single();
        if (!error && data) item = data;
      } catch {}
    }
    setSelectedItem(item);
    setDialogMode("view");
    setShowDetailsDialog(true);
  };

  const handleEditOpportunity = (opportunity: Opportunity) => {
    setSelectedItem(opportunity);
    setEditForm(opportunity);
    setDialogMode("edit");
    setShowDetailsDialog(true);
  };

  const handleDeleteOpportunity = (opportunity: Opportunity) => {
    setSelectedItem(opportunity);
    setDialogMode("delete");
    setShowDetailsDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedItem || !isOpportunity(selectedItem)) return;

    setUpdating(selectedItem.id);
    try {
      // Convert requirements and benefits from string to array if they exist
      const requirementsArray = editForm.requirements
        ? typeof editForm.requirements === "string"
          ? (editForm.requirements as string).split("\n").filter(Boolean)
          : editForm.requirements
        : [];

      const benefitsArray = editForm.benefits
        ? typeof editForm.benefits === "string"
          ? (editForm.benefits as string).split("\n").filter(Boolean)
          : editForm.benefits
        : [];

      const { error } = await supabase
        .from("opportunities")
        .update({
          title: editForm.title,
          description: editForm.description,
          requirements: requirementsArray,
          benefits: benefitsArray,
          organization: editForm.organization,
          location: editForm.location,
          category: editForm.category as
            | "internship"
            | "scholarship"
            | "competition"
            | "event"
            | "job"
            | "research",
          deadline: editForm.deadline,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedItem.id);

      if (error) {
        throw error;
      }

      await fetchOpportunities();
      setShowDetailsDialog(false);
      setDialogMode("view");
    } catch (error) {
      console.error("Error updating opportunity:", error);
      let errorMessage = "Failed to update opportunity. Please try again.";
      if (error && typeof error === "object" && "message" in error) {
        errorMessage = (error as { message: string }).message;
      }
      alert(errorMessage);
    } finally {
      setUpdating(null);
    }
  };

  const deleteOpportunity = async (opportunityId: string) => {
    setUpdating(opportunityId);
    try {
      const { error } = await supabase
        .from("opportunities")
        .delete()
        .eq("id", opportunityId);

      if (error) {
        throw error;
      }

      // Clear caches so deleted opportunities disappear immediately
      localStorage.removeItem("opportunities:v1");
      localStorage.removeItem("featured:v1");
      localStorage.removeItem("admin:opps:v1");
      await fetchOpportunities();
      setShowDetailsDialog(false);
      setDialogMode("view");
    } catch (error) {
      console.error("Error deleting opportunity:", error);
      let errorMessage = "Failed to delete opportunity. Please try again.";
      if (error && typeof error === "object" && "message" in error) {
        errorMessage = (error as { message: string }).message;
      }
      alert(errorMessage);
    } finally {
      setUpdating(null);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const filteredProfiles = profiles.filter((profile) => {
    const matchesSearch =
      (profile.full_name?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (profile.email?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    const matchesFilter = userFilter === "all" || profile.role === userFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredOpportunities = opportunities.filter((opportunity) => {
    const matchesSearch =
      opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opportunity.organization
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesFilter =
      opportunityFilter === "all" || opportunity.status === opportunityFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Admin Panel
                </h1>
                <p className="text-muted-foreground">
                  Manage users, opportunities, and view platform statistics
                </p>
              </div>
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium">
                      Total Users
                    </CardTitle>
                    <HiUser className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalUsers}</div>
                    <p className="text-xs text-muted-foreground">
                      Platform users and administrators
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium">
                      Total Opportunities
                    </CardTitle>
                    <HiDocumentText className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.totalOpportunities}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      All submitted opportunities
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium">
                      Pending Review
                    </CardTitle>
                    <HiClock className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.pendingOpportunities}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Opportunities awaiting approval
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium">
                      Total Applications
                    </CardTitle>
                    <HiDocumentText className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.totalApplications}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Student applications submitted
                    </p>
                  </CardContent>
                </Card>
              </div>

              {stats.pendingOpportunities > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Action Required</CardTitle>
                    <CardDescription>
                      There are {stats.pendingOpportunities} opportunities that
                      need your review
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => setActiveTab("opportunities")}>
                      Review Opportunities
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    View and manage user roles and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input
                          placeholder="Search users..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={userFilter} onValueChange={setUserFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="student">Students</SelectItem>
                        <SelectItem value="admin">Administrators</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {loading ? (
                    <div className="text-center py-4">Loading users...</div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredProfiles.map((profile) => (
                            <TableRow key={profile.id}>
                              <TableCell>
                                {profile.full_name || "Unknown User"}
                              </TableCell>
                              <TableCell>
                                {profile.email || "No email"}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    profile.role === "admin"
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {profile.role || "student"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {format(
                                  new Date(profile.created_at || ""),
                                  "MMM d, yyyy"
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleViewDetails(profile)}
                                  >
                                    <HiEye className="w-4 h-4" />
                                  </Button>
                                  {profile.id !== user?.id && (
                                    <>
                                      {profile.role !== "admin" ? (
                                        <Button
                                          size="sm"
                                          onClick={() =>
                                            updateUserRole(profile.id, "admin")
                                          }
                                          disabled={updating === profile.id}
                                        >
                                          {updating === profile.id
                                            ? "Promoting..."
                                            : "Make Admin"}
                                        </Button>
                                      ) : (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() =>
                                            updateUserRole(
                                              profile.id,
                                              "student"
                                            )
                                          }
                                          disabled={updating === profile.id}
                                        >
                                          {updating === profile.id
                                            ? "Removing..."
                                            : "Remove Admin"}
                                        </Button>
                                      )}
                                    </>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="opportunities" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Opportunity Management</CardTitle>
                  <CardDescription>
                    Review, approve, or reject submitted opportunities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input
                          placeholder="Search opportunities..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select
                      value={opportunityFilter}
                      onValueChange={setOpportunityFilter}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {loading ? (
                    <div className="text-center py-4">
                      Loading opportunities...
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Organization</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Submitted</TableHead>
                            <TableHead className="text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredOpportunities.map((opportunity) => (
                            <TableRow key={opportunity.id}>
                              <TableCell>{opportunity.title}</TableCell>
                              <TableCell>{opportunity.organization}</TableCell>
                              <TableCell>{opportunity.category}</TableCell>
                              <TableCell>
                                <Badge
                                  className={getStatusColor(
                                    opportunity.status || "pending"
                                  )}
                                >
                                  {opportunity.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {format(
                                  new Date(opportunity.created_at || ""),
                                  "MMM d, yyyy"
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      handleViewDetails(opportunity)
                                    }
                                  >
                                    <HiEye className="w-4 h-4" />
                                  </Button>
                                  {opportunity.status === "pending" && (
                                    <>
                                      <Button
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700"
                                        onClick={() =>
                                          updateOpportunityStatus(
                                            opportunity.id,
                                            "approved"
                                          )
                                        }
                                        disabled={updating === opportunity.id}
                                      >
                                        <HiCheck className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() =>
                                          updateOpportunityStatus(
                                            opportunity.id,
                                            "rejected"
                                          )
                                        }
                                        disabled={updating === opportunity.id}
                                      >
                                        <HiX className="w-4 h-4" />
                                      </Button>
                                    </>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      handleEditOpportunity(opportunity)
                                    }
                                    disabled={updating === opportunity.id}
                                  >
                                    <HiPencil className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleDeleteOpportunity(opportunity)
                                    }
                                    disabled={updating === opportunity.id}
                                  >
                                    <HiTrash className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "delete"
                ? "Confirm Deletion"
                : isProfile(selectedItem)
                ? selectedItem.full_name || "Unknown User"
                : isOpportunity(selectedItem)
                ? dialogMode === "edit"
                  ? "Edit Opportunity"
                  : selectedItem.title || "Opportunity Details"
                : "Details"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "delete"
                ? "Are you sure you want to delete this opportunity? This action cannot be undone."
                : isProfile(selectedItem)
                ? selectedItem.email && `Email: ${selectedItem.email}`
                : isOpportunity(selectedItem)
                ? selectedItem.organization &&
                  `Organization: ${selectedItem.organization}`
                : null}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedItem && (
              <div className="space-y-4">
                {/* User Details */}
                {isProfile(selectedItem) && dialogMode === "view" && (
                  <>
                    <div>
                      <strong>Role:</strong> {selectedItem.role}
                    </div>
                    <div>
                      <strong>Joined:</strong>{" "}
                      {format(
                        new Date(selectedItem.created_at || ""),
                        "MMMM d, yyyy"
                      )}
                    </div>
                  </>
                )}

                {/* Opportunity Details */}
                {isOpportunity(selectedItem) && dialogMode === "view" && (
                  <>
                    <div>
                      <strong>Category:</strong> {selectedItem.category}
                    </div>
                    <div>
                      <strong>Status:</strong> {selectedItem.status}
                    </div>
                    <div>
                      <strong>Description:</strong>
                      <p className="mt-1">{selectedItem.description}</p>
                    </div>
                    <div>
                      <strong>Requirements:</strong>
                      <p className="mt-1">
                        {selectedItem.requirements?.join("\n") ||
                          "No requirements specified"}
                      </p>
                    </div>
                    <div>
                      <strong>Benefits:</strong>
                      <p className="mt-1">
                        {selectedItem.benefits?.join("\n") ||
                          "No benefits specified"}
                      </p>
                    </div>
                    <div>
                      <strong>Location:</strong> {selectedItem.location}
                    </div>
                    <div>
                      <strong>Deadline:</strong>{" "}
                      {selectedItem.deadline
                        ? format(
                            new Date(selectedItem.deadline),
                            "MMMM d, yyyy"
                          )
                        : "No deadline"}
                    </div>
                  </>
                )}

                {/* Edit Form */}
                {isOpportunity(selectedItem) && dialogMode === "edit" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Title
                      </label>
                      <Input
                        name="title"
                        value={editForm.title || ""}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Organization
                      </label>
                      <Input
                        name="organization"
                        value={editForm.organization || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Category
                      </label>
                      <Select
                        value={editForm.category || ""}
                        onValueChange={(value) =>
                          setEditForm((prev) => ({ ...prev, category: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="internship">Internship</SelectItem>
                          <SelectItem value="scholarship">
                            Scholarship
                          </SelectItem>
                          <SelectItem value="competition">
                            Competition
                          </SelectItem>
                          <SelectItem value="event">Event</SelectItem>
                          <SelectItem value="job">Job</SelectItem>
                          <SelectItem value="research">Research</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Description
                      </label>
                      <Textarea
                        name="description"
                        value={editForm.description || ""}
                        onChange={handleInputChange}
                        rows={4}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Requirements (one per line)
                      </label>
                      <Textarea
                        name="requirements"
                        value={
                          Array.isArray(editForm.requirements)
                            ? editForm.requirements.join("\n")
                            : editForm.requirements || ""
                        }
                        onChange={handleInputChange}
                        rows={4}
                        placeholder="Enter each requirement on a new line"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Benefits (one per line)
                      </label>
                      <Textarea
                        name="benefits"
                        value={
                          Array.isArray(editForm.benefits)
                            ? editForm.benefits.join("\n")
                            : editForm.benefits || ""
                        }
                        onChange={handleInputChange}
                        rows={4}
                        placeholder="Enter each benefit on a new line"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Location
                      </label>
                      <Input
                        name="location"
                        value={editForm.location || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Deadline
                      </label>
                      <Input
                        type="date"
                        name="deadline"
                        value={
                          editForm.deadline
                            ? new Date(editForm.deadline)
                                .toISOString()
                                .split("T")[0]
                            : ""
                        }
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            {dialogMode === "edit" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDetailsDialog(false);
                    setDialogMode("view");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  disabled={updating === selectedItem?.id}
                >
                  {updating === selectedItem?.id ? "Saving..." : "Save Changes"}
                </Button>
              </>
            )}
            {dialogMode === "delete" && isOpportunity(selectedItem) && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDetailsDialog(false);
                    setDialogMode("view");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteOpportunity(selectedItem.id)}
                  disabled={updating === selectedItem.id}
                >
                  {updating === selectedItem.id
                    ? "Deleting..."
                    : "Delete Opportunity"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

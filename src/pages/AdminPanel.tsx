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
import { getCache, setCache, dedupeRequest } from "../lib/utils";
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
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import type { Database } from "../types/database.types";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  Area,
  AreaChart,
  ComposedChart,
} from "recharts";

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
  const [selectedStat, setSelectedStat] = useState<string | null>(null);
  const [statDetails, setStatDetails] = useState<{
    users?: Profile[];
    opportunities?: Opportunity[];
    pending?: Opportunity[];
    applications?: any[];
  }>({});
  const [loadingStatDetails, setLoadingStatDetails] = useState(false);
  const [statSearchTerm, setStatSearchTerm] = useState("");
  const [chartData, setChartData] = useState<{
    timeSeries?: any[];
    categoryBreakdown?: any[];
    statusDistribution?: any[];
    userGrowth?: any[];
    applicationTrends?: any[];
  }>({});
  const [loadingCharts, setLoadingCharts] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check for dark mode
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };
    checkDarkMode();
    
    // Watch for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Only fetch what's needed for the initial tab (overview stats)
    fetchStats();
    fetchChartData();
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
      // Check cache first
      const cached = getCache<DashboardStats>("admin:stats:v1");
      if (cached) {
        setStats(cached);
      }

      const [
        { count: totalUsers },
        { count: totalOpportunities },
        { count: pendingOpportunities },
        { count: totalApplications },
      ] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase
          .from("opportunities")
          .select("id", { count: "exact", head: true }),
        supabase
          .from("opportunities")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase
          .from("applications")
          .select("id", { count: "exact", head: true }),
      ]);

      const newStats = {
        totalUsers: totalUsers || 0,
        totalOpportunities: totalOpportunities || 0,
        pendingOpportunities: pendingOpportunities || 0,
        totalApplications: totalApplications || 0,
      };
      
      setStats(newStats);
      setCache("admin:stats:v1", newStats, 60_000); // 1 minute cache for stats
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchChartData = async () => {
    setLoadingCharts(true);
    try {
      // Fetch all data in parallel
      const [
      { data: allOpportunities },
      { data: allUsers },
      { data: allApplications },
    ] = await Promise.all([
      supabase
        .from("opportunities")
        .select("created_at, category, status, views_count, applications_count")
        .order("created_at", { ascending: false }),
      supabase
        .from("profiles")
        .select("created_at, role")
        .order("created_at", { ascending: false }),
      supabase
        .from("applications")
        .select("applied_at, status")
        .order("applied_at", { ascending: false }),
    ]);

      const now = new Date();

      // Generate time series data (last 30 days)
      const timeSeriesData: any[] = [];
      for (let i = 29; i >= 0; i--) {
        const date = subDays(now, i);
        const dateStr = format(date, "MMM dd");
        const dateStart = startOfDay(date);
        const dateEnd = endOfDay(date);

        const oppsCount =
          allOpportunities?.filter(
            (opp) =>
              opp.created_at &&
              new Date(opp.created_at) >= dateStart &&
              new Date(opp.created_at) <= dateEnd
          ).length || 0;

        const usersCount =
          allUsers?.filter(
            (user) =>
              user.created_at &&
              new Date(user.created_at) >= dateStart &&
              new Date(user.created_at) <= dateEnd
          ).length || 0;

        const appsCount =
          allApplications?.filter(
            (app) =>
              app.applied_at &&
              new Date(app.applied_at) >= dateStart &&
              new Date(app.applied_at) <= dateEnd
          ).length || 0;

        timeSeriesData.push({
          date: dateStr,
          opportunities: oppsCount,
          users: usersCount,
          applications: appsCount,
        });
      }

      // Category breakdown (approved opportunities only)
      const categoryCounts: Record<string, number> = {};
      allOpportunities?.forEach((opp) => {
        if (opp.status === "approved") {
          const category = opp.category || "other";
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        }
      });

      const categoryBreakdown = Object.entries(categoryCounts)
        .map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value,
        }))
        .sort((a, b) => b.value - a.value);

      // Status distribution
      const statusCounts: Record<string, number> = {};
      allOpportunities?.forEach((opp) => {
        const status = opp.status || "pending";
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });

      const statusDistribution = Object.entries(statusCounts).map(
        ([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value,
        })
      );

      // User growth (weekly)
      const userGrowth: any[] = [];
      for (let i = 7; i >= 0; i--) {
        const weekEnd = subDays(now, i * 7);
        const weekStart = subDays(weekEnd, 6);
        const weekLabel = i === 7 ? "This Week" : `Week ${8 - i}`;

        const totalUsers =
          allUsers?.filter(
            (user) =>
              user.created_at &&
              new Date(user.created_at) <= weekEnd
          ).length || 0;

        const newUsers =
          allUsers?.filter(
            (user) =>
              user.created_at &&
              new Date(user.created_at) >= weekStart &&
              new Date(user.created_at) <= weekEnd
          ).length || 0;

        userGrowth.push({
          period: weekLabel,
          total: totalUsers,
          new: newUsers,
        });
      }

      // Application trends (weekly)
      const applicationTrends: any[] = [];
      for (let i = 7; i >= 0; i--) {
        const weekEnd = subDays(now, i * 7);
        const weekStart = subDays(weekEnd, 6);
        const weekLabel = i === 7 ? "This Week" : `Week ${8 - i}`;

        const total =
          allApplications?.filter(
            (app) =>
              app.applied_at &&
              new Date(app.applied_at) >= weekStart &&
              new Date(app.applied_at) <= weekEnd
          ).length || 0;

        applicationTrends.push({
          period: weekLabel,
          applications: total,
        });
      }

      setChartData({
        timeSeries: timeSeriesData,
        categoryBreakdown,
        statusDistribution,
        userGrowth,
        applicationTrends,
      });
    } catch (error) {
      console.error("Error fetching chart data:", error);
    } finally {
      setLoadingCharts(false);
    }
  };

  const fetchProfiles = async () => {
    try {
      // Check cache first
      const cached = getCache<Profile[]>("admin:profiles:v1");
      if (cached && cached.length) {
        setProfiles(cached);
        setLoading(false);
      }
      
      setLoading(true);
      const data = await dedupeRequest("fetch-admin-profiles", async () => {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        return data || [];
      });

      setProfiles(data);
      if (data) setCache("admin:profiles:v1", data, 120_000);
    } catch (error) {
      console.error("Error fetching profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOpportunities = async () => {
    try {
      // Check cache first
      const cached = getCache<Opportunity[]>("admin:opps:v1");
      if (cached && cached.length) {
        setOpportunities(cached);
        setLoading(false);
      }
      
      setLoading(true);
      const data = await dedupeRequest("fetch-admin-opps", async () => {
        const { data, error } = await supabase
          .from("opportunities")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(200);

        if (error) throw error;
        return data || [];
      });

      setOpportunities(data);
      if (data) setCache("admin:opps:v1", data, 120_000);
    } catch (error) {
      console.error("Error fetching opportunities:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatDetails = async (statType: string) => {
    if (selectedStat === statType) {
      // If clicking the same stat, close it
      setSelectedStat(null);
      setStatDetails({});
      setStatSearchTerm("");
      return;
    }

    setLoadingStatDetails(true);
    setSelectedStat(statType);
    setStatSearchTerm(""); // Reset search when switching stats

    try {
      switch (statType) {
        case "users":
          const { data: usersData } = await supabase
            .from("profiles")
            .select("*")
            .order("created_at", { ascending: false });
          setStatDetails({ users: usersData || [] });
          break;

        case "opportunities":
          const { data: oppsData } = await supabase
            .from("opportunities")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(50);
          setStatDetails({ opportunities: oppsData || [] });
          break;

        case "pending":
          const { data: pendingData } = await supabase
            .from("opportunities")
            .select("*")
            .eq("status", "pending")
            .order("created_at", { ascending: false })
            .limit(50);
          setStatDetails({ pending: pendingData || [] });
          break;

        case "applications":
          const { data: appsData } = await supabase
            .from("applications")
            .select("*, opportunities(title), profiles(full_name, email)")
            .order("applied_at", { ascending: false })
            .limit(50);
          setStatDetails({ applications: appsData || [] });
          break;

        default:
          setStatDetails({});
      }
    } catch (error) {
      console.error("Error fetching stat details:", error);
      setStatDetails({});
    } finally {
      setLoadingStatDetails(false);
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
                <Card
                  className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
                    selectedStat === "users" ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => fetchStatDetails("users")}
                >
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
                <Card
                  className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
                    selectedStat === "opportunities" ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => fetchStatDetails("opportunities")}
                >
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
                <Card
                  className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
                    selectedStat === "pending" ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => fetchStatDetails("pending")}
                >
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
                <Card
                  className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
                    selectedStat === "applications" ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => fetchStatDetails("applications")}
                >
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

              {/* Stat Details Section */}
              {selectedStat && (
                <Card className="mt-6">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <CardTitle>
                          {selectedStat === "users" && "All Users"}
                          {selectedStat === "opportunities" && "All Opportunities"}
                          {selectedStat === "pending" && "Pending Opportunities"}
                          {selectedStat === "applications" && "All Applications"}
                        </CardTitle>
                        <CardDescription>
                          {selectedStat === "users" &&
                            `Showing ${
                              statDetails.users?.filter((user) =>
                                `${user.full_name || ""} ${user.email || ""} ${user.university || ""} ${user.role || ""}`
                                  .toLowerCase()
                                  .includes(statSearchTerm.toLowerCase())
                              ).length || 0
                            } of ${statDetails.users?.length || 0} users`}
                          {selectedStat === "opportunities" &&
                            `Showing ${
                              statDetails.opportunities?.filter((opp) =>
                                `${opp.title || ""} ${opp.organization || ""} ${opp.category || ""} ${opp.status || ""}`
                                  .toLowerCase()
                                  .includes(statSearchTerm.toLowerCase())
                              ).length || 0
                            } of ${statDetails.opportunities?.length || 0} opportunities`}
                          {selectedStat === "pending" &&
                            `Showing ${
                              statDetails.pending?.filter((opp) =>
                                `${opp.title || ""} ${opp.organization || ""} ${opp.category || ""}`
                                  .toLowerCase()
                                  .includes(statSearchTerm.toLowerCase())
                              ).length || 0
                            } of ${statDetails.pending?.length || 0} pending opportunities`}
                          {selectedStat === "applications" &&
                            `Showing ${
                              statDetails.applications?.filter((app: any) =>
                                `${app.profiles?.full_name || ""} ${app.profiles?.email || ""} ${app.opportunities?.title || ""} ${app.status || ""}`
                                  .toLowerCase()
                                  .includes(statSearchTerm.toLowerCase())
                              ).length || 0
                            } of ${statDetails.applications?.length || 0} applications`}
                        </CardDescription>
                      </div>
                      <div className="flex-1 sm:max-w-md">
                        <div className="relative">
                          <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                          <Input
                            placeholder={
                              selectedStat === "users"
                                ? "Search users by name, email, university..."
                                : selectedStat === "applications"
                                ? "Search by user, opportunity, status..."
                                : "Search by title, organization, category..."
                            }
                            value={statSearchTerm}
                            onChange={(e) => setStatSearchTerm(e.target.value)}
                            className="pl-9"
                          />
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loadingStatDetails ? (
                      <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Users Table */}
                        {selectedStat === "users" && statDetails.users && (
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Name</TableHead>
                                  <TableHead>Email</TableHead>
                                  <TableHead>Role</TableHead>
                                  <TableHead>University</TableHead>
                                  <TableHead>Joined</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {statDetails.users
                                  .filter((user) =>
                                    `${user.full_name || ""} ${user.email || ""} ${user.university || ""} ${user.role || ""}`
                                      .toLowerCase()
                                      .includes(statSearchTerm.toLowerCase())
                                  )
                                  .map((user) => (
                                  <TableRow key={user.id}>
                                    <TableCell>
                                      {user.full_name || "Unknown User"}
                                    </TableCell>
                                    <TableCell>{user.email || "No email"}</TableCell>
                                    <TableCell>
                                      <Badge
                                        variant={
                                          user.role === "admin"
                                            ? "default"
                                            : "secondary"
                                        }
                                      >
                                        {user.role || "student"}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      {user.university || "-"}
                                    </TableCell>
                                    <TableCell>
                                      {user.created_at
                                        ? format(
                                            new Date(user.created_at),
                                            "MMM dd, yyyy"
                                          )
                                        : "-"}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}

                        {/* Opportunities Table */}
                        {(selectedStat === "opportunities" ||
                          selectedStat === "pending") &&
                          (statDetails.opportunities ||
                            statDetails.pending) && (
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Organization</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">
                                      Actions
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {(selectedStat === "opportunities"
                                    ? statDetails.opportunities
                                    : statDetails.pending
                                  )
                                    ?.filter((opp) =>
                                      `${opp.title || ""} ${opp.organization || ""} ${opp.category || ""} ${selectedStat === "opportunities" ? opp.status || "" : ""}`
                                        .toLowerCase()
                                        .includes(statSearchTerm.toLowerCase())
                                    )
                                    .map((opp) => (
                                    <TableRow key={opp.id}>
                                      <TableCell className="font-medium">
                                        {opp.title}
                                      </TableCell>
                                      <TableCell>
                                        <Badge variant="outline" className="capitalize">
                                          {opp.category}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>{opp.organization || "-"}</TableCell>
                                      <TableCell>
                                        <Badge
                                          variant={
                                            opp.status === "approved"
                                              ? "default"
                                              : opp.status === "rejected"
                                              ? "destructive"
                                              : "secondary"
                                          }
                                        >
                                          {opp.status || "pending"}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        {opp.created_at
                                          ? format(
                                              new Date(opp.created_at),
                                              "MMM dd, yyyy"
                                            )
                                          : "-"}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            setSelectedItem(opp);
                                            setDialogMode("view");
                                            setShowDetailsDialog(true);
                                          }}
                                        >
                                          <HiEye className="w-4 h-4" />
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          )}

                        {/* Applications Table */}
                        {selectedStat === "applications" &&
                          statDetails.applications && (
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Opportunity</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Applied Date</TableHead>
                                    <TableHead>Notes</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {statDetails.applications
                                    .filter((app: any) =>
                                      `${app.profiles?.full_name || ""} ${app.profiles?.email || ""} ${app.opportunities?.title || ""} ${app.status || ""} ${app.application_notes || ""}`
                                        .toLowerCase()
                                        .includes(statSearchTerm.toLowerCase())
                                    )
                                    .map((app: any) => (
                                    <TableRow key={app.id}>
                                      <TableCell>
                                        {app.profiles?.full_name ||
                                          app.profiles?.email ||
                                          "Unknown User"}
                                      </TableCell>
                                      <TableCell>
                                        {app.opportunities?.title || "-"}
                                      </TableCell>
                                      <TableCell>
                                        <Badge variant="outline" className="capitalize">
                                          {app.status || "applied"}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        {app.applied_at
                                          ? format(
                                              new Date(app.applied_at),
                                              "MMM dd, yyyy"
                                            )
                                          : "-"}
                                      </TableCell>
                                      <TableCell>
                                        {app.application_notes || "-"}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Statistics Charts Section */}
              <div className="space-y-6 mt-6">
                {loadingCharts ? (
                  <Card>
                    <CardContent className="flex justify-center items-center py-24">
                      <div className="space-y-4 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="text-muted-foreground">Loading charts...</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {/* Time Series Activity Chart */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Activity Over Time (Last 30 Days)</CardTitle>
                        <CardDescription>
                          Daily trends for opportunities, users, and applications
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={400}>
                          <AreaChart
                            data={chartData.timeSeries || []}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                          >
                            <defs>
                              <linearGradient id="colorOpps" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                              </linearGradient>
                              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                              </linearGradient>
                              <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                            <XAxis
                              dataKey="date"
                              stroke={isDarkMode ? "#ffffff" : "hsl(var(--muted-foreground))"}
                              fontSize={12}
                              tickLine={false}
                              axisLine={false}
                              tick={{ fill: isDarkMode ? "#ffffff" : "hsl(var(--muted-foreground))" }}
                            />
                            <YAxis
                              stroke={isDarkMode ? "#ffffff" : "hsl(var(--muted-foreground))"}
                              fontSize={12}
                              tickLine={false}
                              axisLine={false}
                              tick={{ fill: isDarkMode ? "#ffffff" : "hsl(var(--muted-foreground))" }}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "8px",
                                padding: "12px",
                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                color: isDarkMode ? "#ffffff" : "hsl(var(--foreground))",
                              }}
                              labelStyle={{ color: isDarkMode ? "#ffffff" : "hsl(var(--foreground))" }}
                              cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
                            />
                            <Legend
                              wrapperStyle={{ 
                                paddingTop: "20px",
                                color: isDarkMode ? "#ffffff" : "hsl(var(--foreground))"
                              }}
                              iconType="circle"
                            />
                            <Area
                              type="monotone"
                              dataKey="opportunities"
                              stackId="1"
                              stroke="#3b82f6"
                              strokeWidth={2}
                              fillOpacity={1}
                              fill="url(#colorOpps)"
                              name="Opportunities"
                            />
                            <Area
                              type="monotone"
                              dataKey="users"
                              stackId="1"
                              stroke="#10b981"
                              strokeWidth={2}
                              fillOpacity={1}
                              fill="url(#colorUsers)"
                              name="New Users"
                            />
                            <Area
                              type="monotone"
                              dataKey="applications"
                              stackId="1"
                              stroke="#8b5cf6"
                              strokeWidth={2}
                              fillOpacity={1}
                              fill="url(#colorApps)"
                              name="Applications"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Status Distribution */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Opportunity Status Distribution</CardTitle>
                          <CardDescription>
                            Breakdown of all opportunities by approval status
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={chartData.statusDistribution || []}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={(entry: any) => {
                                  const RADIAN = Math.PI / 180;
                                  const radius = 120;
                                  const { cx, cy, midAngle, name, percent } = entry;
                                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                  return (
                                    <text
                                      x={x}
                                      y={y}
                                      fill={isDarkMode ? "#ffffff" : "hsl(var(--foreground))"}
                                      textAnchor={x > cx ? "start" : "end"}
                                      dominantBaseline="central"
                                      fontSize={12}
                                      fontWeight={500}
                                    >
                                      {`${name}: ${(percent * 100).toFixed(0)}%`}
                                    </text>
                                  );
                                }}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {chartData.statusDistribution?.map((entry, index) => {
                                  const colors = ["#10b981", "#f59e0b", "#ef4444"];
                                  return (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={colors[index % colors.length]}
                                    />
                                  );
                                })}
                              </Pie>
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "hsl(var(--card))",
                                  border: "1px solid hsl(var(--border))",
                                  borderRadius: "8px",
                                  padding: "12px",
                                  color: isDarkMode ? "#ffffff" : "hsl(var(--foreground))",
                                }}
                                labelStyle={{ color: isDarkMode ? "#ffffff" : "hsl(var(--foreground))" }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="mt-6 space-y-3">
                            {chartData.statusDistribution?.map((entry, index) => {
                              const colors = ["#10b981", "#f59e0b", "#ef4444"];
                              const total = chartData.statusDistribution?.reduce(
                                (sum, e) => sum + e.value,
                                0
                              ) || 1;
                              const percentage = ((entry.value / total) * 100).toFixed(1);
                              return (
                                <div
                                  key={entry.name}
                                  className="flex items-center justify-between text-sm"
                                >
                                  <span className="flex items-center gap-2">
                                    <div
                                      className="w-3 h-3 rounded-full"
                                      style={{
                                        backgroundColor: colors[index % colors.length],
                                      }}
                                    ></div>
                                    <span className="text-muted-foreground">
                                      {entry.name}
                                    </span>
                                  </span>
                                  <div className="flex items-center gap-3">
                                    <span className="text-muted-foreground text-xs">
                                      {percentage}%
                                    </span>
                                    <span className="font-semibold text-foreground">
                                      {entry.value}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Category Breakdown */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Opportunities by Category</CardTitle>
                          <CardDescription>
                            Distribution of approved opportunities across categories
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                              data={chartData.categoryBreakdown || []}
                              layout="vertical"
                              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="hsl(var(--border))"
                                opacity={0.3}
                              />
                              <XAxis
                                type="number"
                                stroke={isDarkMode ? "#ffffff" : "hsl(var(--muted-foreground))"}
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: isDarkMode ? "#ffffff" : "hsl(var(--muted-foreground))" }}
                              />
                              <YAxis
                                dataKey="name"
                                type="category"
                                width={100}
                                stroke={isDarkMode ? "#ffffff" : "hsl(var(--muted-foreground))"}
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: isDarkMode ? "#ffffff" : "hsl(var(--muted-foreground))" }}
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "hsl(var(--card))",
                                  border: "1px solid hsl(var(--border))",
                                  borderRadius: "8px",
                                  padding: "12px",
                                  color: isDarkMode ? "#ffffff" : "hsl(var(--foreground))",
                                }}
                                labelStyle={{ color: isDarkMode ? "#ffffff" : "hsl(var(--foreground))" }}
                              />
                              <Bar
                                dataKey="value"
                                fill="#3b82f6"
                                radius={[0, 8, 8, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* User Growth Trend */}
                      <Card>
                        <CardHeader>
                          <CardTitle>User Growth Trend (8 Weeks)</CardTitle>
                          <CardDescription>
                            Cumulative user growth and weekly new user registrations
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <ComposedChart
                              data={chartData.userGrowth || []}
                              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                            >
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="hsl(var(--border))"
                                opacity={0.3}
                              />
                              <XAxis
                                dataKey="period"
                                stroke={isDarkMode ? "#ffffff" : "hsl(var(--muted-foreground))"}
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: isDarkMode ? "#ffffff" : "hsl(var(--muted-foreground))" }}
                              />
                              <YAxis
                                yAxisId="left"
                                stroke={isDarkMode ? "#ffffff" : "hsl(var(--muted-foreground))"}
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: isDarkMode ? "#ffffff" : "hsl(var(--muted-foreground))" }}
                              />
                              <YAxis
                                yAxisId="right"
                                orientation="right"
                                stroke={isDarkMode ? "#ffffff" : "hsl(var(--muted-foreground))"}
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: isDarkMode ? "#ffffff" : "hsl(var(--muted-foreground))" }}
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "hsl(var(--card))",
                                  border: "1px solid hsl(var(--border))",
                                  borderRadius: "8px",
                                  padding: "12px",
                                  color: isDarkMode ? "#ffffff" : "hsl(var(--foreground))",
                                }}
                                labelStyle={{ color: isDarkMode ? "#ffffff" : "hsl(var(--foreground))" }}
                              />
                              <Legend
                                wrapperStyle={{ color: isDarkMode ? "#ffffff" : "hsl(var(--foreground))" }}
                              />
                              <Bar
                                yAxisId="right"
                                dataKey="new"
                                fill="#10b981"
                                name="New Users"
                                radius={[4, 4, 0, 0]}
                              />
                              <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="total"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                dot={{ r: 4, fill: "#3b82f6" }}
                                name="Total Users"
                              />
                            </ComposedChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      {/* Application Trends */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Application Trends (8 Weeks)</CardTitle>
                          <CardDescription>
                            Weekly application submissions over time
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                              data={chartData.applicationTrends || []}
                              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                            >
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="hsl(var(--border))"
                                opacity={0.3}
                              />
                              <XAxis
                                dataKey="period"
                                stroke={isDarkMode ? "#ffffff" : "hsl(var(--muted-foreground))"}
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: isDarkMode ? "#ffffff" : "hsl(var(--muted-foreground))" }}
                              />
                              <YAxis
                                stroke={isDarkMode ? "#ffffff" : "hsl(var(--muted-foreground))"}
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: isDarkMode ? "#ffffff" : "hsl(var(--muted-foreground))" }}
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "hsl(var(--card))",
                                  border: "1px solid hsl(var(--border))",
                                  borderRadius: "8px",
                                  padding: "12px",
                                  color: isDarkMode ? "#ffffff" : "hsl(var(--foreground))",
                                }}
                                labelStyle={{ color: isDarkMode ? "#ffffff" : "hsl(var(--foreground))" }}
                              />
                              <Bar
                                dataKey="applications"
                                fill="#8b5cf6"
                                fillOpacity={1}
                                radius={[8, 8, 0, 0]}
                                name="Applications"
                                stroke="#8b5cf6"
                                strokeWidth={0}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>
                  </>
                )}
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

import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  HiCheckCircle,
  HiClock,
  HiXCircle,
  HiPlus,
  HiBookmark,
  HiEye,
} from "react-icons/hi";
import Navigation from "../components/Navigation";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import type { Opportunity } from "../types/database.types";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";

interface BookmarkWithOpportunity {
  opportunity_id: string;
  opportunities: Opportunity;
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [submittedOpportunities, setSubmittedOpportunities] = useState<
    Opportunity[]
  >([]);
  const [bookmarkedOpportunities, setBookmarkedOpportunities] = useState<
    Opportunity[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const showSuccess = searchParams.get("submitted") === "true";

  useEffect(() => {
    console.log(
      "Dashboard useEffect triggered. Auth loading:",
      authLoading,
      "User:",
      user?.id
    );

    // Wait for auth to finish loading before making decisions
    if (authLoading) {
      console.log("Still loading auth...");
      return;
    }

    if (user) {
      console.log("User found, fetching data...");
      fetchUserData();
    } else {
      console.log("No user found, stopping loading");
      setLoading(false);
    }

    if (showSuccess) {
      const timer = setTimeout(() => {
        setSearchParams({});
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [user, authLoading, showSuccess, setSearchParams]);

  const fetchUserData = async () => {
    console.log("Fetching user data for:", user?.id);
    setLoading(true);
    setError(null);

    try {
      console.log("Fetching submitted + bookmarks in parallel...");
      const [submittedRes, bookmarksRes] = await Promise.all([
        supabase
          .from("opportunities")
          .select("*")
          .eq("submitted_by", user?.id as string)
          .order("created_at", { ascending: false }),
        supabase
          .from("bookmarks")
          .select(
            `opportunity_id, opportunities (*)`
          )
          .eq("user_id", user?.id as string),
      ]);

      if (submittedRes.error) throw submittedRes.error;
      if (bookmarksRes.error) throw bookmarksRes.error;

      setSubmittedOpportunities(submittedRes.data || []);
      const bookmarkedOppsList =
        (bookmarksRes.data as BookmarkWithOpportunity[])
          ?.map((b) => b.opportunities)
          .filter(Boolean) || [];
      setBookmarkedOpportunities(bookmarkedOppsList);

      console.log("Data fetching completed successfully");
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError(
        "Failed to load dashboard data. Please try refreshing the page."
      );
    } finally {
      console.log("Setting loading to false");
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <HiCheckCircle className="w-5 h-5 text-green-500" />;
      case "pending":
        return <HiClock className="w-5 h-5 text-yellow-500" />;
      case "rejected":
        return <HiXCircle className="w-5 h-5 text-red-500" />;
      default:
        return <HiClock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "Approved";
      case "pending":
        return "Under Review";
      case "rejected":
        return "Rejected";
      default:
        return "Unknown";
    }
  };

  const getStatusVariant = (
    status: string
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "approved":
        return "default";
      case "pending":
        return "secondary";
      case "rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  // Show loading while auth is still loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center py-24">
            <div className="space-y-4 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Loading your session...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If user is not logged in, show login prompt
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="py-24">
              <div className="text-center space-y-6">
                <h2 className="text-3xl font-bold text-foreground">
                  Please Sign In
                </h2>
                <p className="text-muted-foreground text-lg max-w-md mx-auto">
                  You need to be signed in to view your dashboard.
                </p>
                <Button asChild size="lg">
                  <Link to="/auth/login">Sign In</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {showSuccess && (
          <Card className="mb-8 border-green-200 bg-green-50/50">
            <CardContent className="p-6">
              <div className="flex">
                <HiCheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-900">
                    🎉 Opportunity Submitted Successfully!
                  </h3>
                  <p className="mt-1 text-sm text-green-800">
                    Your opportunity has been submitted for review. You'll be
                    notified once it's approved and live on the platform.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <Card className="mb-8 border-red-200 bg-red-50/50">
            <CardContent className="p-6">
              <div className="flex">
                <HiXCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-900">
                    Error Loading Dashboard
                  </h3>
                  <p className="mt-1 text-sm text-red-800">{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => fetchUserData()}
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Welcome to Your Dashboard
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Track your submissions, manage your bookmarks, and discover your
            next opportunity
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="space-y-4 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Loading your dashboard...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Quick Actions</CardTitle>
                <CardDescription>
                  Get started with these common actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button asChild size="lg" className="h-20 flex-col gap-2">
                    <Link to="/submit">
                      <HiPlus className="w-6 h-6" />
                      <span>Submit New Opportunity</span>
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-20 flex-col gap-2"
                  >
                    <Link to="/opportunities">
                      <HiEye className="w-6 h-6" />
                      <span>Browse All Opportunities</span>
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-20 flex-col gap-2"
                  >
                    <Link to="/opportunities">
                      <HiBookmark className="w-6 h-6" />
                      <span>Find New Bookmarks</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Submissions</CardDescription>
                  <CardTitle className="text-3xl font-bold text-blue-600">
                    {submittedOpportunities.length}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    {
                      submittedOpportunities.filter(
                        (o) => o.status === "pending"
                      ).length
                    }{" "}
                    pending review
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Approved Opportunities</CardDescription>
                  <CardTitle className="text-3xl font-bold text-green-600">
                    {
                      submittedOpportunities.filter(
                        (o) => o.status === "approved"
                      ).length
                    }
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Live on the platform
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Saved Bookmarks</CardDescription>
                  <CardTitle className="text-3xl font-bold text-purple-600">
                    {bookmarkedOpportunities.length}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Opportunities you've saved
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* My Submissions */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-2xl">My Submissions</CardTitle>
                    <CardDescription>
                      Opportunities you've submitted (
                      {submittedOpportunities.length})
                    </CardDescription>
                  </div>
                  {submittedOpportunities.length > 0 && (
                    <Button asChild variant="outline">
                      <Link to="/submit">
                        <HiPlus className="w-4 h-4 mr-2" />
                        Submit Another
                      </Link>
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {submittedOpportunities.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto bg-muted rounded-full flex items-center justify-center mb-6">
                      <HiPlus className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      No submissions yet
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Share opportunities with the community by submitting them
                      for review. Help fellow students discover amazing
                      opportunities!
                    </p>
                    <Button asChild size="lg">
                      <Link to="/submit">
                        <HiPlus className="w-5 h-5 mr-2" />
                        Submit Your First Opportunity
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {submittedOpportunities.map((opportunity, index) => (
                      <div key={opportunity.id}>
                        {index > 0 && <Separator />}
                        <div className="py-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center gap-3">
                                <h3 className="text-lg font-semibold text-foreground">
                                  {opportunity.title}
                                </h3>
                                <Badge
                                  variant={getStatusVariant(
                                    opportunity.status || "pending"
                                  )}
                                >
                                  {getStatusText(
                                    opportunity.status || "pending"
                                  )}
                                </Badge>
                              </div>
                              <p className="text-muted-foreground line-clamp-2">
                                {opportunity.description}
                              </p>
                              <div className="flex items-center text-sm text-muted-foreground gap-4">
                                <Badge variant="outline" className="capitalize">
                                  {opportunity.category}
                                </Badge>
                                <span>{opportunity.organization}</span>
                                <span>
                                  Submitted{" "}
                                  {new Date(
                                    opportunity.created_at || ""
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-6 flex items-center">
                              {getStatusIcon(opportunity.status || "pending")}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bookmarked Opportunities */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-2xl">
                      Bookmarked Opportunities
                    </CardTitle>
                    <CardDescription>
                      Opportunities you've saved for later (
                      {bookmarkedOpportunities.length})
                    </CardDescription>
                  </div>
                  <Button asChild variant="outline">
                    <Link to="/opportunities">
                      <HiEye className="w-4 h-4 mr-2" />
                      Browse More
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {bookmarkedOpportunities.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto bg-muted rounded-full flex items-center justify-center mb-6">
                      <HiBookmark className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      No bookmarks yet
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Start bookmarking opportunities that interest you to keep
                      track of them and apply when you're ready.
                    </p>
                    <Button asChild size="lg">
                      <Link to="/opportunities">
                        <HiEye className="w-5 h-5 mr-2" />
                        Browse Opportunities
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookmarkedOpportunities
                      .slice(0, 5)
                      .map((opportunity, index) => (
                        <div key={opportunity.id}>
                          {index > 0 && <Separator />}
                          <div className="py-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 space-y-3">
                                <h3 className="text-lg font-semibold text-foreground">
                                  {opportunity.title}
                                </h3>
                                <p className="text-muted-foreground line-clamp-2">
                                  {opportunity.description}
                                </p>
                                <div className="flex items-center text-sm text-muted-foreground gap-4">
                                  <Badge
                                    variant="outline"
                                    className="capitalize"
                                  >
                                    {opportunity.category}
                                  </Badge>
                                  <span>{opportunity.organization}</span>
                                  {opportunity.deadline && (
                                    <span>
                                      Deadline:{" "}
                                      {new Date(
                                        opportunity.deadline
                                      ).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="ml-6 flex items-center">
                                <HiBookmark className="w-5 h-5 text-blue-500" />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    {bookmarkedOpportunities.length > 5 && (
                      <div className="text-center pt-4">
                        <Button asChild variant="outline">
                          <Link to="/opportunities">
                            View all {bookmarkedOpportunities.length} bookmarks
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

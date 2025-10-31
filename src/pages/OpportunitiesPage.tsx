import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { HiSearch, HiFilter, HiPlus, HiXCircle } from "react-icons/hi";
import Navigation from "../components/Navigation";
import OpportunityCard from "../components/OpportunityCard";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import type { Opportunity } from "../types/database.types";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { getCache, setCache } from "../lib/utils";

export default function OpportunitiesPage() {
  const { user, loading: authLoading } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [bookmarkedOpportunities, setBookmarkedOpportunities] = useState<
    string[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "deadline" | "featured">(
    "newest"
  );
  const [showAll, setShowAll] = useState(false);

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "internship", label: "Internships" },
    { value: "scholarship", label: "Scholarships" },
    { value: "competition", label: "Competitions" },
    { value: "event", label: "Events" },
    { value: "job", label: "Jobs" },
    { value: "research", label: "Research" },
  ];

  useEffect(() => {
    // Hydrate instantly from cache
    const cached = getCache<Opportunity[]>("opportunities:v1");
    if (cached && cached.length) {
      setOpportunities(cached);
      setLoading(false);
    }

    // Fetch fresh data in background (don't block UI if cache exists)
    fetchOpportunities();

    // Only fetch bookmarks if user is authenticated and auth is not loading
    if (!authLoading && user) {
      fetchBookmarks();
    } else if (!authLoading) {
      setBookmarkedOpportunities([]);
    }
  }, [user, authLoading]);

  const fetchOpportunities = async () => {
    // Only show loading if we don't have cached data
    const hasCache = getCache<Opportunity[]>("opportunities:v1");
    if (!hasCache || !hasCache.length) {
      setLoading(true);
    }
    setError(null);

    try {
      const { data, error } = await supabase
        .from("opportunities")
        .select(
          "id,title,category,deadline,location,organization,description,application_url,featured,status,views_count,applications_count,created_at,updated_at,benefits,requirements,submitted_by"
        )
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(24);

      if (error) {
        throw error;
      }

      setOpportunities(data || []);
      if (data && data.length) setCache("opportunities:v1", data, 120_000);
    } catch (error) {
      setError("Failed to load opportunities. Please try refreshing the page.");
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("bookmarks")
        .select("opportunity_id")
        .eq("user_id", user.id);

      if (error) throw error;

      setBookmarkedOpportunities(
        data?.map((bookmark) => bookmark.opportunity_id) || []
      );
    } catch (error) {
      // Don't set error state for bookmarks - it's not critical
    }
  };

  const handleBookmarkToggle = () => {
    if (user) {
      fetchBookmarks();
    }
  };

  const filteredAndSortedOpportunities = opportunities
    .filter((opportunity) => {
      const matchesSearch =
        opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opportunity.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        opportunity.organization
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || opportunity.category === selectedCategory;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "deadline":
          if (!a.deadline && !b.deadline) return 0;
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return (
            new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
          );

        case "featured":
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return (
            new Date(b.created_at || "").getTime() -
            new Date(a.created_at || "").getTime()
          );

        case "newest":
        default:
          return (
            new Date(b.created_at || "").getTime() -
            new Date(a.created_at || "").getTime()
          );
      }
    });

  const visibleOpportunities = showAll
    ? filteredAndSortedOpportunities
    : filteredAndSortedOpportunities.slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Enhanced Hero Header */}
      <div className="relative border-b bg-gradient-to-br from-background via-background to-primary/5 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-primary/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-r from-secondary/10 to-transparent rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
                Discover Amazing
                <br />
                <span className="text-primary">Opportunities</span>
              </h1>
              <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Find internships, scholarships, competitions, and more
                opportunities
                <span className="font-semibold text-foreground">
                  tailored for students like you
                </span>
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-6">
              <Badge
                variant="secondary"
                className="bg-blue-50 text-blue-700 border-blue-200 px-4 py-2 text-sm font-medium"
              >
                🎓 Student-focused
              </Badge>
              <Badge
                variant="secondary"
                className="bg-green-50 text-green-700 border-green-200 px-4 py-2 text-sm font-medium"
              >
                🔍 Carefully curated
              </Badge>
              <Badge
                variant="secondary"
                className="bg-purple-50 text-purple-700 border-purple-200 px-4 py-2 text-sm font-medium"
              >
                🚀 Career-boosting
              </Badge>
              <Badge
                variant="secondary"
                className="bg-orange-50 text-orange-700 border-orange-200 px-4 py-2 text-sm font-medium"
              >
                ⚡ Real-time updates
              </Badge>
            </div>

            {/* Quick stats */}
            <div className="flex flex-wrap justify-center gap-8 pt-8 text-center">
              <div className="space-y-1">
                <div className="text-3xl font-bold text-primary">
                  {opportunities.length}+
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                  Active Opportunities
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-primary">6</div>
                <div className="text-sm text-muted-foreground font-medium">
                  Categories
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-primary">24/7</div>
                <div className="text-sm text-muted-foreground font-medium">
                  New Updates
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-background border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                  <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search opportunities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Category Filter */}
                  <div className="flex items-center gap-2">
                    <HiFilter className="text-muted-foreground w-4 h-4" />
                    <Select
                      value={selectedCategory}
                      onValueChange={setSelectedCategory}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem
                            key={category.value}
                            value={category.value}
                          >
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort Selection */}
                  <Select
                    value={sortBy}
                    onValueChange={(
                      value: "newest" | "deadline" | "featured"
                    ) => setSortBy(value)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="deadline">Deadline Soon</SelectItem>
                      <SelectItem value="featured">Featured First</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Submit Button */}
                  {user && (
                    <Button asChild>
                      <Link to="/submit">
                        <HiPlus className="w-4 h-4 mr-2" />
                        Submit Opportunity
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <Card className="mb-8 border-red-200 bg-red-50/50">
            <CardContent className="p-6">
              <div className="flex">
                <HiXCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-900">
                    Error Loading Opportunities
                  </h3>
                  <p className="mt-1 text-sm text-red-800">{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => fetchOpportunities()}
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          /* Loading State with Skeleton Cards */
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2">
                <div className="h-8 w-64 bg-muted animate-pulse rounded"></div>
                <div className="h-5 w-48 bg-muted animate-pulse rounded"></div>
              </div>
            </div>

            <Separator />

            <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card
                  key={index}
                  className="h-full flex flex-col animate-pulse"
                >
                  <CardHeader className="pb-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-20 bg-muted rounded-full"></div>
                        <div className="h-4 w-16 bg-muted rounded"></div>
                      </div>
                      <div className="h-5 w-full bg-muted rounded"></div>
                      <div className="h-4 w-3/4 bg-muted rounded"></div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 pb-4 space-y-4">
                    <div className="space-y-2">
                      <div className="h-3 w-full bg-muted rounded"></div>
                      <div className="h-3 w-5/6 bg-muted rounded"></div>
                      <div className="h-3 w-4/6 bg-muted rounded"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-muted rounded"></div>
                      <div className="h-4 w-40 bg-muted rounded"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-28 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded"></div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 mt-auto">
                    <div className="w-full space-y-3">
                      <div className="h-px bg-muted"></div>
                      <div className="flex justify-between items-center">
                        <div className="flex gap-3">
                          <div className="h-4 w-12 bg-muted rounded"></div>
                          <div className="h-4 w-16 bg-muted rounded"></div>
                        </div>
                        <div className="h-8 w-20 bg-muted rounded"></div>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        ) : filteredAndSortedOpportunities.length === 0 ? (
          /* Empty State */
          <Card>
            <CardContent className="py-24">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 mx-auto bg-muted rounded-full flex items-center justify-center">
                  <HiSearch className="w-10 h-10 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-semibold text-foreground">
                    No opportunities found
                  </h3>
                  <p className="text-muted-foreground text-lg max-w-md mx-auto">
                    {searchTerm || selectedCategory !== "all"
                      ? "Try adjusting your search criteria or explore different categories"
                      : "Be the first to share an amazing opportunity with the community!"}
                  </p>
                </div>
                {user && (
                  <Button size="lg" asChild>
                    <Link to="/submit">
                      <HiPlus className="w-5 h-5 mr-2" />
                      Submit First Opportunity
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Opportunities Grid */
          <div className="space-y-6">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">
                  {filteredAndSortedOpportunities.length} Opportunit
                  {filteredAndSortedOpportunities.length === 1
                    ? "y"
                    : "ies"}{" "}
                  Found
                </h2>
                <p className="text-muted-foreground">
                  {selectedCategory !== "all" &&
                    `Filtered by ${
                      categories.find((c) => c.value === selectedCategory)
                        ?.label
                    }`}
                  {searchTerm &&
                    (selectedCategory !== "all" ? " • " : "") +
                      `Searching for "${searchTerm}"`}
                </p>
              </div>

              <div className="text-sm text-muted-foreground">
                Sorted by{" "}
                {sortBy === "newest"
                  ? "newest first"
                  : sortBy === "deadline"
                  ? "deadline approaching"
                  : "featured first"}
              </div>
            </div>

            <Separator />

            {/* Opportunities Grid */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
              {visibleOpportunities.map((opportunity, index) => (
                <div
                  key={opportunity.id}
                  className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                  style={{
                    animationDelay: `${Math.min(index * 50, 400)}ms`,
                    animationFillMode: "both",
                  }}
                >
                  <OpportunityCard
                    opportunity={opportunity}
                    isBookmarked={bookmarkedOpportunities.includes(
                      opportunity.id
                    )}
                    onBookmarkToggle={handleBookmarkToggle}
                  />
                </div>
              ))}
            </div>

            {/* Show remaining button */}
            {!showAll && filteredAndSortedOpportunities.length > 6 && (
              <div className="text-center pt-4">
                <Button size="lg" variant="default" onClick={() => setShowAll(true)}>
                  Show remaining {filteredAndSortedOpportunities.length - 6}
                </Button>
              </div>
            )}

            {/* Load count */}
            {showAll && (
              <div className="text-center pt-6 space-y-3">
                <p className="text-muted-foreground">
                  Showing all {filteredAndSortedOpportunities.length} opportunities
                </p>
                <Button variant="outline" size="lg" onClick={() => setShowAll(false)}>
                  View less
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

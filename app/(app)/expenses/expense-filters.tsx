"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  CalendarIcon,
  Search,
  X,
  Filter,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { Category } from "@/lib/supabase/queries/categories";
import type { ExpenseFilters as FilterType } from "@/lib/supabase/queries/expenses";

interface ExpenseFiltersProps {
  categories: Category[];
  currentFilters: FilterType;
}

const paymentMethods = [
  { value: "credit_card", label: "Credit Card" },
  { value: "debit_card", label: "Debit Card" },
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "other", label: "Other" },
];

export function ExpenseFilters({
  categories,
  currentFilters,
}: ExpenseFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isExpanded, setIsExpanded] = useState(false);

  const [search, setSearch] = useState(currentFilters.search || "");
  const [startDate, setStartDate] = useState<Date | undefined>(
    currentFilters.startDate ? new Date(currentFilters.startDate) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    currentFilters.endDate ? new Date(currentFilters.endDate) : undefined
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    currentFilters.categoryIds || []
  );
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<
    string[]
  >(currentFilters.paymentMethods || []);
  const [minAmount, setMinAmount] = useState<string>(
    currentFilters.minAmount?.toString() || ""
  );
  const [maxAmount, setMaxAmount] = useState<string>(
    currentFilters.maxAmount?.toString() || ""
  );

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    // Clear all filter params first
    params.delete("search");
    params.delete("startDate");
    params.delete("endDate");
    params.delete("categories");
    params.delete("paymentMethods");
    params.delete("minAmount");
    params.delete("maxAmount");

    // Add active filters
    if (search) params.set("search", search);
    if (startDate) params.set("startDate", format(startDate, "yyyy-MM-dd"));
    if (endDate) params.set("endDate", format(endDate, "yyyy-MM-dd"));
    if (selectedCategories.length > 0)
      params.set("categories", selectedCategories.join(","));
    if (selectedPaymentMethods.length > 0)
      params.set("paymentMethods", selectedPaymentMethods.join(","));
    if (minAmount) params.set("minAmount", minAmount);
    if (maxAmount) params.set("maxAmount", maxAmount);

    router.push(`/expenses?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearch("");
    setStartDate(undefined);
    setEndDate(undefined);
    setSelectedCategories([]);
    setSelectedPaymentMethods([]);
    setMinAmount("");
    setMaxAmount("");
    router.push("/expenses");
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const togglePaymentMethod = (method: string) => {
    setSelectedPaymentMethods((prev) =>
      prev.includes(method)
        ? prev.filter((m) => m !== method)
        : [...prev, method]
    );
  };

  const hasActiveFilters =
    search ||
    startDate ||
    endDate ||
    selectedCategories.length > 0 ||
    selectedPaymentMethods.length > 0 ||
    minAmount ||
    maxAmount;

  const activeFilterCount = [
    search,
    startDate,
    endDate,
    selectedCategories.length > 0,
    selectedPaymentMethods.length > 0,
    minAmount,
    maxAmount,
  ].filter(Boolean).length;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Search Bar - Always visible */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by description, category, or notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") applyFilters();
                }}
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              className="relative"
            >
              <Filter className="h-4 w-4" />
              {activeFilterCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 text-xs"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Expanded Filters */}
          {isExpanded && (
            <div className="space-y-4 border-t pt-4">
              {/* Date Range */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? (
                          format(startDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">End Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? (
                          format(endDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Amount Range */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Min Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={minAmount}
                      onChange={(e) => setMinAmount(e.target.value)}
                      className="pl-7"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Max Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={maxAmount}
                      onChange={(e) => setMaxAmount(e.target.value)}
                      className="pl-7"
                    />
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Categories</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Badge
                      key={category.id}
                      variant={
                        selectedCategories.includes(category.id)
                          ? "default"
                          : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() => toggleCategory(category.id)}
                    >
                      <span className="mr-1">{category.icon}</span>
                      {category.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Methods</label>
                <div className="flex flex-wrap gap-2">
                  {paymentMethods.map((method) => (
                    <Badge
                      key={method.value}
                      variant={
                        selectedPaymentMethods.includes(method.value)
                          ? "default"
                          : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() => togglePaymentMethod(method.value)}
                    >
                      {method.label}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button onClick={applyFilters} className="flex-1">
                  Apply Filters
                </Button>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

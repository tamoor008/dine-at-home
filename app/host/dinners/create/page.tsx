"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { createDinner } from "@/lib/api";
import { uploadDinnerImage } from "@/lib/supabase";
import { HostGuard } from "@/components/auth/host-guard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Users,
  DollarSign,
  MapPin,
  Upload,
  Plus,
  X,
  Save,
  ArrowLeft,
  ChefHat,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import Image from "next/image";

export default function CreateDinnerPage() {
  const router = useRouter();
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dinnerData, setDinnerData] = useState({
    title: "",
    description: "",
    cuisineType: "",
    dietaryAccommodations: [] as string[],
    menu: "",
    ingredients: "",
    specialInstructions: "",

    // Location & Access
    address: "",
    city: "",
    state: "",
    zipCode: "",
    directions: "",

    // Date & Time
    date: "",
    time: "",
    duration: 3,

    // Capacity & Pricing
    maxCapacity: 8,
    pricePerPerson: 85,
    minGuests: 2,

    // Images
    images: [] as string[],

    // Additional Details
    seatingType: "shared", // shared or private

    includesDrinks: false,
    includesDessert: false,
    cancellationPolicy: "flexible",
  });

  const cuisineTypes = [
    "Italian",
    "French",
    "Japanese",
    "Chinese",
    "Indian",
    "Mexican",
    "Mediterranean",
    "American",
    "Thai",
    "Korean",
    "Spanish",
    "Greek",
    "Lebanese",
    "Ethiopian",
    "Vietnamese",
    "Fusion",
    "Other",
  ];

  const dietaryAccommodations = [
    "Vegetarian",
    "Vegan",
    "Gluten-Free",
    "Dairy-Free",
    "Nut-Free",
    "Kosher",
    "Halal",
    "Low-Sodium",
    "Diabetic-Friendly",
  ];

  const handleInputChange = (field: string, value: any) => {
    setDinnerData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDietaryToggle = (dietary: string) => {
    setDinnerData((prev) => ({
      ...prev,
      dietaryAccommodations: prev.dietaryAccommodations.includes(dietary)
        ? prev.dietaryAccommodations.filter((d) => d !== dietary)
        : [...prev.dietaryAccommodations, dietary],
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setIsUploading(true);
      const uploadedUrls: string[] = [];

      try {
        await Promise.all(
          Array.from(files).map(async (file) => {
            try {
              const url = await uploadDinnerImage(file);
              uploadedUrls.push(url);
            } catch (error) {
              console.error("Failed to upload image:", error);
              toast.error(`Failed to upload ${file.name}`);
            }
          })
        );

        if (uploadedUrls.length > 0) {
          setDinnerData((prev) => ({
            ...prev,
            images: [...prev.images, ...uploadedUrls],
          }));

          // Clear error if images exist
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.images;
            return newErrors;
          });
          toast.success(
            `Successfully uploaded ${uploadedUrls.length} image(s)`
          );
        }
      } catch (error) {
        toast.error("An error occurred while uploading images");
      } finally {
        setIsUploading(false);
        // Reset file input
        e.target.value = "";
      }
    }
  };

  const addSamplePhoto = () => {
    const sampleImages = [
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80",
      "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&q=80",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
      "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=800&q=80",
    ];
    const randomImage =
      sampleImages[Math.floor(Math.random() * sampleImages.length)];
    setDinnerData((prev) => ({
      ...prev,
      images: [...prev.images, randomImage],
    }));
    // Clear error
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.images;
      return newErrors;
    });
  };

  const removeImage = (index: number) => {
    setDinnerData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // imports need to be updated first, doing that in a separate block?
  // No, I can't add imports with this tool easily if they are far away.
  // I will assume I can edit the whole file or use multi_replace.
  // Let's use multi_replace to handle imports and handlesubmit separately.
  // Actually, I'll just replace the handleSubmit part first, but I need imports.
  // Let's use one big replacement for the top of the file to include imports and logic.

  // Wait, I need to import useAuth and createDinner.
  // I'll restart the tool call strategy.
  // I will use multi_replace_file_content.

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      if (!session?.access_token) {
        throw new Error("You must be logged in to create a dinner");
      }

      // Validation
      const requiredFields = [
        { key: "title", label: "Title" },
        { key: "description", label: "Description" },
        { key: "cuisineType", label: "Cuisine Type" },
        { key: "menu", label: "Menu" },
        { key: "address", label: "Address" },
        { key: "city", label: "City" },
        { key: "state", label: "State" },
        { key: "date", label: "Date" },
        { key: "time", label: "Time" },
      ];

      for (const field of requiredFields) {
        // @ts-ignore
        if (!dinnerData[field.key]) {
          throw new Error(`${field.label} is required`);
        }
      }

      if (dinnerData.images.length === 0) {
        setErrors((prev) => ({
          ...prev,
          images: "Please upload at least one photo",
        }));
        throw new Error("Please upload at least one photo");
      }

      if (dinnerData.pricePerPerson <= 0) {
        throw new Error("Price must be greater than 0");
      }

      const payload = {
        title: dinnerData.title,
        description: dinnerData.description,
        price: {
          amount: dinnerData.pricePerPerson,
          currency: "USD",
        },
        date: new Date(`${dinnerData.date}T${dinnerData.time}`).toISOString(),
        duration: dinnerData.duration,
        capacity: dinnerData.maxCapacity,
        images: dinnerData.images,
        cuisine: dinnerData.cuisineType,
        dietary: dinnerData.dietaryAccommodations.join(", "),
        instantBook: true,
        menu: dinnerData.menu.split("\n").filter((line) => line.trim() !== ""),
        included: [
          dinnerData.includesDrinks ? "Drinks" : null,
          dinnerData.includesDessert ? "Dessert" : null,
        ].filter(Boolean) as string[],
        houseRules: ["No smoking", "Please arrive on time"],
        location: {
          address: dinnerData.address,
          city: dinnerData.city,
          state: dinnerData.state,
          neighborhood: "",
          coordinates: { lat: 0, lng: 0 },
        },
        isActive: true,
      };

      await createDinner(payload, session.access_token);
      toast.success("Dinner created successfully!");
      router.push("/host/dashboard");
    } catch (error: any) {
      console.error("Failed to create dinner:", error);
      toast.error(
        error.message || "Failed to create dinner. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <HostGuard>
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Create New Dinner
                </h1>
                <p className="text-muted-foreground mt-1">
                  Share your culinary passion with guests
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push("/host/dashboard")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="w-5 h-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Tell guests about your dining experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Dinner Title *
                  </label>
                  <Input
                    value={dinnerData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="e.g., Authentic Italian Pasta Making Workshop"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description *
                  </label>
                  <Textarea
                    value={dinnerData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Describe your dining experience, what makes it special, and what guests can expect..."
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      Cuisine Type *
                    </label>
                    <Select
                      value={dinnerData.cuisineType}
                      onValueChange={(value) =>
                        handleInputChange("cuisineType", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select cuisine type" />
                      </SelectTrigger>
                      <SelectContent>
                        {cuisineTypes.map((cuisine) => (
                          <SelectItem key={cuisine} value={cuisine}>
                            {cuisine}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">
                    Dietary Accommodations
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {dietaryAccommodations.map((dietary) => (
                      <Button
                        key={dietary}
                        type="button"
                        variant={
                          dinnerData.dietaryAccommodations.includes(dietary)
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => handleDietaryToggle(dietary)}
                        className="justify-start"
                      >
                        {dietary}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Menu & Food Details */}
            <Card>
              <CardHeader>
                <CardTitle>Menu & Food Details</CardTitle>
                <CardDescription>What will you be serving?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Menu Description *
                  </label>
                  <Textarea
                    value={dinnerData.menu}
                    onChange={(e) => handleInputChange("menu", e.target.value)}
                    placeholder="Describe each course, appetizers, main dishes, and any special preparations..."
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Key Ingredients
                  </label>
                  <Textarea
                    value={dinnerData.ingredients}
                    onChange={(e) =>
                      handleInputChange("ingredients", e.target.value)
                    }
                    placeholder="List main ingredients, any allergens, or special ingredients you'll be using..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Special Instructions
                  </label>
                  <Textarea
                    value={dinnerData.specialInstructions}
                    onChange={(e) =>
                      handleInputChange("specialInstructions", e.target.value)
                    }
                    placeholder="Any special preparation methods, cooking techniques, or guest participation details..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="includesDrinks"
                      checked={dinnerData.includesDrinks}
                      onChange={(e) =>
                        handleInputChange("includesDrinks", e.target.checked)
                      }
                      className="rounded"
                    />
                    <label
                      htmlFor="includesDrinks"
                      className="text-sm font-medium"
                    >
                      Includes Drinks (wine, beverages)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="includesDessert"
                      checked={dinnerData.includesDessert}
                      onChange={(e) =>
                        handleInputChange("includesDessert", e.target.checked)
                      }
                      className="rounded"
                    />
                    <label
                      htmlFor="includesDessert"
                      className="text-sm font-medium"
                    >
                      Includes Dessert
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location & Access */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location & Access
                </CardTitle>
                <CardDescription>
                  Where will the dinner take place?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Street Address *
                  </label>
                  <Input
                    value={dinnerData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    placeholder="123 Main Street"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      City *
                    </label>
                    <Input
                      value={dinnerData.city}
                      onChange={(e) =>
                        handleInputChange("city", e.target.value)
                      }
                      placeholder="New York"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      State *
                    </label>
                    <Input
                      value={dinnerData.state}
                      onChange={(e) =>
                        handleInputChange("state", e.target.value)
                      }
                      placeholder="NY"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      ZIP Code *
                    </label>
                    <Input
                      value={dinnerData.zipCode}
                      onChange={(e) =>
                        handleInputChange("zipCode", e.target.value)
                      }
                      placeholder="10001"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Directions & Access
                  </label>
                  <Textarea
                    value={dinnerData.directions}
                    onChange={(e) =>
                      handleInputChange("directions", e.target.value)
                    }
                    placeholder="Parking instructions, building access, elevator usage, etc."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Date, Time & Capacity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Date, Time & Capacity
                </CardTitle>
                <CardDescription>When and how many guests?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Date *
                    </label>
                    <Input
                      type="date"
                      value={dinnerData.date}
                      onChange={(e) =>
                        handleInputChange("date", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Start Time *
                    </label>
                    <Input
                      type="time"
                      value={dinnerData.time}
                      onChange={(e) =>
                        handleInputChange("time", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Duration (hours)
                    </label>
                    <Select
                      value={dinnerData.duration.toString()}
                      onValueChange={(value) =>
                        handleInputChange("duration", parseInt(value))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 hours</SelectItem>
                        <SelectItem value="3">3 hours</SelectItem>
                        <SelectItem value="4">4 hours</SelectItem>
                        <SelectItem value="5">5 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Max Capacity *
                    </label>
                    <Select
                      value={dinnerData.maxCapacity.toString()}
                      onValueChange={(value) =>
                        handleInputChange("maxCapacity", parseInt(value))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4">4 guests</SelectItem>
                        <SelectItem value="6">6 guests</SelectItem>
                        <SelectItem value="8">8 guests</SelectItem>
                        <SelectItem value="10">10 guests</SelectItem>
                        <SelectItem value="12">12 guests</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Min Guests
                    </label>
                    <Select
                      value={dinnerData.minGuests.toString()}
                      onValueChange={(value) =>
                        handleInputChange("minGuests", parseInt(value))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 guests</SelectItem>
                        <SelectItem value="4">4 guests</SelectItem>
                        <SelectItem value="6">6 guests</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Seating Type
                    </label>
                    <Select
                      value={dinnerData.seatingType}
                      onValueChange={(value) =>
                        handleInputChange("seatingType", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="shared">Shared Table</SelectItem>
                        <SelectItem value="private">Private Dining</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Price Per Person *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="number"
                        value={dinnerData.pricePerPerson}
                        onChange={(e) =>
                          handleInputChange(
                            "pricePerPerson",
                            parseInt(e.target.value)
                          )
                        }
                        placeholder="85"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Photos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Photos
                </CardTitle>
                <CardDescription>Show guests what to expect</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Upload Photos
                  </label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload photos of your dishes, kitchen, or dining space
                    </p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="photo-upload"
                    />
                    <div className="flex gap-4 justify-center">
                      <Button type="button" variant="outline" asChild>
                        <label
                          htmlFor="photo-upload"
                          className="cursor-pointer flex items-center justify-center gap-2"
                        >
                          {isUploading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                          {isUploading ? "Uploading..." : "Upload Photos"}
                        </label>
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={addSamplePhoto}
                      >
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Use Sample Photo
                      </Button>
                    </div>
                  </div>
                  {errors.images && (
                    <p className="text-sm text-destructive font-medium mt-2 text-center">
                      {errors.images}
                    </p>
                  )}
                </div>

                {dinnerData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {dinnerData.images.map((image, index) => (
                      <div key={index} className="relative">
                        <Image
                          src={image}
                          alt={`Dinner photo ${index + 1}`}
                          width={200}
                          height={150}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="absolute top-2 right-2 w-6 h-6 p-0"
                          onClick={() => removeImage(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Policies */}
            <Card>
              <CardHeader>
                <CardTitle>Policies</CardTitle>
                <CardDescription>
                  Set your cancellation and booking policies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Cancellation Policy
                  </label>
                  <Select
                    value={dinnerData.cancellationPolicy}
                    onValueChange={(value) =>
                      handleInputChange("cancellationPolicy", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flexible">
                        Flexible - Full refund 24h before
                      </SelectItem>
                      <SelectItem value="moderate">
                        Moderate - Full refund 5 days before
                      </SelectItem>
                      <SelectItem value="strict">
                        Strict - 50% refund up to 7 days before
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex items-center justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/host/dashboard")}
              >
                Cancel
              </Button>
              <Button type="submit" className="gap-2" disabled={loading}>
                <Save className="w-4 h-4" />
                {loading ? "Creating..." : "Create Dinner"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </HostGuard>
  );
}

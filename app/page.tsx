"use client"

import { useEffect, useState } from "react";
import { Search, MapPin, Bell, User, Heart, Plus, Check, FocusIcon, XIcon, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import { usePiAuth } from "@/contexts/pi-auth-context";
import { usePreferences } from '@/contexts/preferences-context';
import Onboarding from "@/components/onboarding";
import { useTranslation } from "@/hooks/use-translation";
import type { PiUser } from "@swetate/auth";


export default function PiMarketApp() {
  const authContext = usePiAuth();
  const prefContext = usePreferences();
  const { t, currentLang, changeLanguage } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [piUser, setPiUser] = useState<PiUser | null>(null);

  // State to toggle the notification listing dropdown/modal
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  // Mock list of user notifications
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Your offer for iPhone 14 Pro was accepted!", seen: false, time: "2m ago" },
    { id: 2, text: "New listing matching your location presets.", seen: false, time: "1h ago" },
    { id: 3, text: "Welcome to Pi Marketplace! Verify your profile.", seen: true, time: "1d ago" },
  ]);

  // State to toggle the profile dropdown menu
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Mock user stats 
  const [userStats, setUserStats] = useState({
    fullName: "John Doe",
    rating: 4.8,
    reviewCount: 24,
    listingsCount: 5,
    favoritesCount: 12,
    reviewsMadeCount: 8
  });

  // State for location
  const [location, setLocation] = useState<string>(t("location.none"));
  const [isEditingLocation, setIsEditingLocation] = useState<boolean>(false);
  const [locationInput, setLocationInput] = useState<string>("");
  // Location suggestion state
  const [suggestions, setSuggestions] = useState<any[]>([]);

  // 2. SYNCHRONIZE VALUES INSIDE EFFECT
  useEffect(() => {
    // Simulating Pi Network Auth Check
    const checkAuth = async () => {
      if (authContext && authContext.user) {
        setPiUser(authContext.user);
      }
      setIsAuthenticated(true);
    };
    // Checking Persistent Storage configuration flags

    checkAuth();
  }, [authContext?.user]);

  // NOTIFICATION
  // Derived state: automatically checks if there is any notification where seen is false
  const hasUnseen = notifications.some(n => !n.seen);

  // Helper function to mark all as read when opening the panel (or clicking individual entries)
  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, seen: true })));
  };

  // LOCATION
  // Location auto-detect helper
  const handleAutoDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Simple reverse geocoding approach using a free open API
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();

          // Extract a readable city/country name
          const cityName = data.address.city || data.address.town || data.address.village || "Unknown Location";
          const countryName = data.address.country || "";
          const formattedLocation = `${cityName}, ${countryName}`;

          setLocation(formattedLocation);
          setLocationInput(formattedLocation);
        } catch (err) {
          // Fallback to coordinates if the geocoding service fails
          setLocation(`Lat: ${latitude.toFixed(2)}, Lon: ${longitude.toFixed(2)}`);
        }
      },
      () => {
        alert("Unable to retrieve your GPS location. Please type it manually.");
      }
    );
  };

  const handleLocationInputChange = async (value: string) => {
    setLocationInput(value);

    if (value.trim().length > 2) {
      try {
        // Query OpenStreetMap for matching regions/cities
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&addressdetails=1&limit=5`
        );
        const data = await response.json();
        setSuggestions(data);
      } catch (error) {
        console.error("Error fetching location suggestions:", error);
      }
    } else {
      setSuggestions([]);
    }
  };

  const categories = [
    { name: "Electronics", icon: "📱", color: "bg-blue-100" },
    { name: "Fashion", icon: "👕", color: "bg-pink-100" },
    { name: "Home", icon: "🏠", color: "bg-green-100" },
    { name: "Books", icon: "📚", color: "bg-yellow-100" },
    { name: "Sports", icon: "⚽", color: "bg-orange-100" },
    { name: "Food", icon: "🍕", color: "bg-red-100" },
  ]

  const featuredProducts = [
    {
      id: 1,
      title: "iPhone 14 Pro",
      price: "850π",
      location: "2.3 km away",
      image: "/placeholder.svg?height=200&width=200",
      seller: "TechStore",
      rating: 4.8,
      isNew: true,
    },
    {
      id: 2,
      title: "Vintage Leather Jacket",
      price: "120π",
      location: "1.8 km away",
      image: "/placeholder.svg?height=200&width=200",
      seller: "FashionHub",
      rating: 4.6,
      isNew: false,
    },
    {
      id: 3,
      title: "Gaming Setup",
      price: "450π",
      location: "3.1 km away",
      image: "/placeholder.svg?height=200&width=200",
      seller: "GameZone",
      rating: 4.9,
      isNew: true,
    },
    {
      id: 4,
      title: "Organic Coffee Beans",
      price: "25π",
      location: "0.8 km away",
      image: "/placeholder.svg?height=200&width=200",
      seller: "LocalCafe",
      rating: 4.7,
      isNew: false,
    },
  ]
  // Show loading spinner while hooks process persistent storage records
  if (prefContext.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    );
  }

  // Handle Unauthenticated State
  if (!isAuthenticated) {
    return <div>{t("auth.login")}</div>;
  }

  // Force onboarding for new profile
  if (prefContext.needsOnboarding === true) {
    return (
      <Onboarding
        onComplete={() => prefContext.completeOnboarding()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3 relative">
            {/* Left Section: Logo & Name */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">π</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">{t("app.name")}</h1>
            </div>

            {/* Right Section: Notification Bell & User Dropdown */}
            <div className="flex items-center space-x-2">

              {/* Notification Bell Icon Area */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setIsNotificationOpen(!isNotificationOpen);
                    setIsProfileOpen(false);
                  }}
                  className="w-10 h-10 rounded-full relative hover:bg-gray-100 transition-colors"
                >
                  <Bell className="h-5 w-5 text-gray-700" />
                  {hasUnseen && (
                    <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
                  )}
                </Button>

                {/* Click Outside Invisible Backdrop */}
                {isNotificationOpen && (
                  <div
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setIsNotificationOpen(false)}
                  />
                )}

                {/* Floating Dropdown List Layer */}
                {isNotificationOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-2 max-h-80 overflow-y-auto pointer-events-auto">
                    <div className="px-3 pb-2 pt-1 border-b border-gray-100 flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-900">{t("notification.heading")}</span>
                      {hasUnseen && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-[10px] text-purple-600 font-semibold hover:underline">{t("notification.mark.read")}
                        </button>
                      )}
                    </div>

                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-xs text-gray-400">{t("notification.none")}</div>
                    ) : (
                      <div className="divide-y divide-gray-50">
                        {notifications.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => {
                              // Mark single clicked notification entry as seen
                              setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, seen: true } : n));
                            }}
                            className={`px-3 py-2.5 text-left flex items-start space-x-2 cursor-pointer transition-colors ${item.seen ? 'hover:bg-gray-50' : 'bg-purple-50/40 hover:bg-purple-50'}`}
                          >
                            {/* Dynamic Unseen Dot Indicator on Entry */}
                            {!item.seen && (
                              <span className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5 animate-pulse"></span>
                            )}

                            <div className="flex-1 min-w-0">
                              <p className={`text-xs text-gray-700 leading-tight ${!item.seen ? 'font-medium text-gray-900' : ''}`}>
                                {item.text}
                              </p>
                              <span className="text-[10px] text-gray-400 block mt-0.5">{item.time}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User Avatar & Dropdown Menu */}
              <div className="relative">
                <button
                  onClick={() => {
                    setIsProfileOpen(!isProfileOpen);
                    setIsNotificationOpen(false);
                  }}
                  className="focus:outline-none block rounded-full ring-2 ring-transparent hover:ring-purple-200 transition w-8 h-8"
                >
                  <Avatar className="h-8 w-8">
                    {/* Remove AvatarImage if it's pointing to a broken local file */}
                    <AvatarFallback className="bg-slate-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-slate-500" />
                    </AvatarFallback>
                  </Avatar>
                </button>

                {/* Click Outside Invisible Backdrop */}
                {isProfileOpen && (
                  <div
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setIsProfileOpen(false)}
                  />
                )}

                {/* Profile Dropdown Layer */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-2 pointer-events-auto">
                    <>
                      <div className="px-4 py-2.5 border-b border-gray-50 flex justify-between items-center bg-gray-50/50 rounded-t-xl">
                        <span className="text-xs font-bold text-gray-800 truncate pr-2">
                          Hi, @{piUser?.username ?? "Pioneer"}
                        </span>
                        <div className="flex items-center text-[11px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded flex-shrink-0">
                          <span className="ml-0.5">{userStats.rating}</span>
                          <span>★</span>
                          <span className="text-gray-400 font-normal ml-0.5">({userStats.reviewCount})</span>
                        </div>
                      </div>

                      <div className="p-1 space-y-0.5">
                        <button onClick={() => setIsProfileOpen(false)} className="w-full flex items-center justify-between px-3 py-2 text-xs text-gray-700 hover:bg-purple-50 rounded-lg transition text-left">
                          <span className="font-medium">My Listings</span>
                          <span className="bg-gray-100 text-gray-600 font-semibold px-2 py-0.5 rounded-full text-[10px]">{userStats.listingsCount}</span>
                        </button>
                        <button onClick={() => setIsProfileOpen(false)} className="w-full flex items-center justify-between px-3 py-2 text-xs text-gray-700 hover:bg-purple-50 rounded-lg transition text-left">
                          <span className="font-medium">Favorite Listings</span>
                          <span className="bg-purple-50 text-purple-600 font-semibold px-2 py-0.5 rounded-full text-[10px]">{userStats.favoritesCount}</span>
                        </button>
                        <button onClick={() => setIsProfileOpen(false)} className="w-full flex items-center justify-between px-3 py-2 text-xs text-gray-700 hover:bg-purple-50 rounded-lg transition text-left">
                          <span className="font-medium">My Reviews</span>
                          <span className="bg-gray-100 text-gray-600 font-semibold px-2 py-0.5 rounded-full text-[10px]">{userStats.reviewsMadeCount}</span>
                        </button>
                      </div>
                    </>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={t("search.holder")}
              className="pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-full"
            />
          </div>

          {/* Location */}
          <div className="flex w-full items-center justify-between mt-2 text-sm text-gray-600">
            {isEditingLocation ? (
              <div className="w-full mt-2">
                {/* Unified Single Line Layout */}
                <div className="flex items-center space-x-1.5 w-full">
                  {/* Container for Input + Floating Dropdown */}
                  <div className="relative flex-1 min-w-0">
                    <input
                      type="text"
                      value={locationInput}
                      onChange={(e) => handleLocationInputChange(e.target.value)}
                      placeholder={t("location.holder")}
                      className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
                    />

                    {/* Floating Suggestion List */}
                    {suggestions.length > 0 && (
                      <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                        {suggestions.map((item, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => {
                              // Set the input field to this value and clear the list
                              setLocationInput(item.display_name);
                              setSuggestions([]);
                            }}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-purple-50 text-gray-700 border-b border-gray-50 last:border-none block truncate"
                          >
                            📍 {item.display_name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Utilities */}
                  <button
                    onClick={handleAutoDetectLocation}
                    type="button"
                    className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg flex-shrink-0 transition"
                    title="Detect Location"
                  >
                    <FocusIcon className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => {
                      setLocation(locationInput || "");
                      setIsEditingLocation(false);
                      setSuggestions([]);
                    }}
                    type="button"
                    className="p-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg flex-shrink-0 transition"
                    title="Save"
                  >
                    <Check className="h-4 w-4 font-bold" />
                  </button>

                  <button
                    onClick={() => {
                      setIsEditingLocation(false);
                      setSuggestions([]);  // clear
                    }}
                    type="button"
                    className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg flex-shrink-0 transition"
                    title="Cancel"
                  >
                    <XIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* View mode when not editing */
              <div className="flex w-full items-center justify-between mt-2 text-sm text-gray-600">
                {/* Left side: Icon and Location text wrapped together */}
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span className="font-medium text-gray-500">
                    {location ? location : t("location.none")}
                  </span>
                </div>
                <button className="text-sm text-purple-600 font-semibold hover:underline"
                  onClick={() => {
                    setLocationInput(location);
                    setIsEditingLocation(true);
                  }}
                > {t("button.edit")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pb-20">
        {/* Categories */}
        <div className="px-4 mb-6">
          <h2 className="text-lg font-semibold mb-3">{t("category.heading")}</h2>
          <div className="grid grid-cols-3 gap-3">
            {categories.map((category, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-3 text-center">
                  <div
                    className={`w-12 h-12 ${category.color} rounded-full flex items-center justify-center mx-auto mb-2`}
                  >
                    <span className="text-xl">{category.icon}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-700">{category.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Featured Products */}
        <div className="px-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">{t("listing.heading")}</h2>
            {/*<Button variant="ghost" size="sm" color="text-purple-600">{t("listing.view.all")}</Button>*/}
            <button className="text-sm text-purple-600 font-semibold hover:underline">{t("listing.view.all")}</button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="relative">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.title}
                        width={200}
                        height={150}
                        className="w-full h-32 object-cover rounded-t-lg"
                      />
                    ) : (
                      /* Clean, responsive placeholder block that mimics an image layout */
                      <div className="w-full h-32 bg-slate-100 flex flex-col items-center justify-center rounded-t-lg gap-1 border-b border-slate-100">
                        <Package className="h-8 w-8 text-slate-400 stroke-[1.5]" />
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">No Image</span>
                      </div>
                    )}
                    {product.isNew && <Badge className="absolute top-2 left-2 bg-green-500">New</Badge>}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 bg-white/80 hover:bg-white"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="p-3">
                    <h3 className="font-medium text-sm mb-1 line-clamp-2">{product.title}</h3>
                    <p className="text-lg font-bold text-purple-600 mb-1">{product.price}</p>
                    <div className="flex items-center text-xs text-gray-500 mb-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>{product.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">{product.seller}</span>
                      <div className="flex items-center">
                        <span className="text-xs text-yellow-500">★</span>
                        <span className="text-xs text-gray-600 ml-1">{product.rating}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Add button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="grid grid-cols-5 py-2">
          <Button
            key='add'
            variant="ghost"
            className="flex flex-col items-center py-2 px-1 h-auto text-purple-600600"
            onClick={() => setIsNotificationOpen(false)}>
            <div className="absolute inset-0 bg-purple-600 rounded-full flex items-center justify-center -mt-2">
              <Plus className="h-8 w-8 bold text-white" />
            </div>
          </Button>
        </div>
      </div>
    </div>
  )
}

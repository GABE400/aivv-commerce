import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  Box,
  ShoppingBag,
  Sparkles,
  Layers,
  CreditCard,
  BarChart3
} from "lucide-react";

export const getLinksForRole = (role: string) => {
  const adminLinks = [
    { name: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
    { name: "Analytics", href: "/dashboard/admin/analytics", icon: BarChart3 },
    { name: "Products", href: "/dashboard/admin/products", icon: Package },
    { name: "Categories", href: "/dashboard/admin/categories", icon: Layers },
    { name: "Orders", href: "/dashboard/admin/orders", icon: ShoppingCart },
    { name: "Supplier Payments", href: "/dashboard/admin/supplier-payments", icon: CreditCard },
    { name: "Users", href: "/dashboard/admin/users", icon: Users },
    { name: "User Dashboard", href: "/dashboard/customer", icon: ShoppingBag },
    { name: "Business Console", href: "/dashboard/business", icon: Box },
  ];

  const businessLinks = [
    { name: "Overview", href: "/dashboard/business", icon: LayoutDashboard },
    { name: "AI Automation Workspace", href: "/dashboard/customer/automate", icon: Sparkles },
    { name: "Billing", href: "/dashboard/user/billing", icon: CreditCard },
    { name: "Settings", href: "/dashboard/customer/settings", icon: Settings },
    { name: "Shop Store", href: "/shop", icon: ShoppingBag },
  ];

  const customerLinks = [
    { name: "Shop Store", href: "/shop", icon: ShoppingBag },
    { name: "Overview", href: "/dashboard/customer", icon: LayoutDashboard },
    { name: "Orders", href: "/dashboard/customer/orders", icon: ShoppingCart },
    { name: "Library", href: "/dashboard/customer/library", icon: Box },
    { name: "AI Automation Workspace", href: "/dashboard/customer/automate", icon: Sparkles },
    { name: "Billing", href: "/dashboard/user/billing", icon: CreditCard },
    { name: "Settings", href: "/dashboard/customer/settings", icon: Settings },
  ];

  return role === "admin" ? adminLinks : role === "business" ? businessLinks : customerLinks;
};

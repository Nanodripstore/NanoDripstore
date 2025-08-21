'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Upload, 
  FileSpreadsheet, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3,
  Settings,
  Database
} from 'lucide-react';

export default function AdminDashboard() {
  const adminCards = [
    {
      title: 'Live Sheet Sync',
      description: 'Sync products from your live Google Sheet database',
      icon: Database,
      href: '/admin/sync',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50'
    },
    {
      title: 'Import Products',
      description: 'Import products from Excel files or Google Sheets',
      icon: Upload,
      href: '/admin/import',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Manage Products',
      description: 'View and edit existing products',
      icon: Package,
      href: '/admin/products',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Product Variants',
      description: 'Manage product colors and variants',
      icon: Database,
      href: '/admin/variants',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Qikink Integration',
      description: 'Manage Qikink products and sync',
      icon: FileSpreadsheet,
      href: '/admin/qikink',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Orders',
      description: 'View and manage customer orders',
      icon: ShoppingCart,
      href: '/admin/orders',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Customers',
      description: 'Manage customer accounts',
      icon: Users,
      href: '/admin/customers',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      title: 'Analytics',
      description: 'View sales and performance metrics',
      icon: BarChart3,
      href: '/admin/analytics',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    },
    {
      title: 'Settings',
      description: 'Configure store settings',
      icon: Settings,
      href: '/admin/settings',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    }
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your store, products, and customer data from this central location.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {adminCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className={`w-12 h-12 rounded-lg ${card.bgColor} flex items-center justify-center mb-3`}>
                  <IconComponent className={`h-6 w-6 ${card.color}`} />
                </div>
                <CardTitle className="text-lg">{card.title}</CardTitle>
                <CardDescription className="text-sm">
                  {card.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button asChild className="w-full">
                  <Link href={card.href}>
                    Open
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Quick Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">
                Import products to get started
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">
                Orders this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">
                Registered users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹--</div>
              <p className="text-xs text-muted-foreground">
                This month's revenue
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Getting Started</h2>
        <Card>
          <CardHeader>
            <CardTitle>Welcome to NanoDripstore Admin</CardTitle>
            <CardDescription>
              Here are the next steps to set up your store:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">1</span>
                </div>
                <div>
                  <p className="font-medium">Import your first products</p>
                  <p className="text-sm text-muted-foreground">
                    Use the Import Products feature to add products from Excel or Google Sheets
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 font-semibold text-sm">2</span>
                </div>
                <div>
                  <p className="font-medium">Configure product variants</p>
                  <p className="text-sm text-muted-foreground">
                    Set up colors, sizes, and pricing for your products
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-purple-600 font-semibold text-sm">3</span>
                </div>
                <div>
                  <p className="font-medium">Connect with Qikink</p>
                  <p className="text-sm text-muted-foreground">
                    Sync your products with Qikink for printing and fulfillment
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

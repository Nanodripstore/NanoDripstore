'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MapPin, Edit2, Trash2, Plus, Check, Star, StarOff } from 'lucide-react';
import { useAddresses, Address } from '@/hooks/use-addresses';

interface AddressBookProps {
  addresses: Address[];
  onAddressChange: () => void;
}

export default function AddressBook({ addresses, onAddressChange }: AddressBookProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    isDefault: false
  });
  
  const { addAddress, updateAddress, deleteAddress, setDefaultAddress, loading } = useAddresses();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let result;
    
    if (editingId) {
      result = await updateAddress({ id: editingId, ...formData });
    } else {
      result = await addAddress(formData);
    }
    
    if (result) {
      onAddressChange();
      resetForm();
    }
  };

  const handleEdit = (address: Address) => {
    setEditingId(address.id);
    setFormData({
      name: address.name,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      isDefault: address.isDefault
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    const addressToDelete = addresses.find(addr => addr.id === id);
    
    if (addressToDelete?.isDefault && addresses.length > 1) {
      const confirmed = window.confirm(
        'This is your default address. Deleting it will remove your default delivery address. Are you sure you want to continue?'
      );
      if (!confirmed) return;
    } else if (addressToDelete?.isDefault === false) {
      const confirmed = window.confirm('Are you sure you want to delete this address?');
      if (!confirmed) return;
    } else {
      const confirmed = window.confirm('Are you sure you want to delete this address?');
      if (!confirmed) return;
    }
    
    const result = await deleteAddress(id);
    if (result) {
      onAddressChange();
    }
  };

  const handleSetDefault = async (id: string) => {
    setSettingDefaultId(id);
    const result = await setDefaultAddress(id);
    if (result) {
      onAddressChange();
    }
    setSettingDefaultId(null);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      isDefault: false
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <MapPin size={20} />
          Your Addresses
        </h2>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)} 
          variant="outline" 
          size="sm"
        >
          {showAddForm ? 'Cancel' : (
            <div className="flex items-center gap-1">
              <Plus size={16} />
              Add New Address
            </div>
          )}
        </Button>
      </div>
      
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Address' : 'Add New Address'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddressSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input 
                    id="street"
                    name="street"
                    placeholder="123 Main St"
                    value={formData.street}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input 
                    id="city"
                    name="city"
                    placeholder="New York"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input 
                    id="state"
                    name="state"
                    placeholder="NY"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">Postal/ZIP Code</Label>
                  <Input 
                    id="zipCode"
                    name="zipCode"
                    placeholder="10001"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input 
                    id="country"
                    name="country"
                    placeholder="United States"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="flex items-start space-x-3 pt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <input
                  type="checkbox"
                  id="isDefault"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleInputChange}
                  className="h-4 w-4 mt-0.5 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <Label htmlFor="isDefault" className="text-sm font-medium text-blue-900 cursor-pointer">
                    Set as default address
                  </Label>
                  <p className="text-xs text-blue-700 mt-1">
                    Your default address will be automatically selected during checkout
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : (editingId ? 'Update Address' : 'Save Address')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      
      {addresses.length === 0 ? (
        <div className="text-center p-8 border border-dashed rounded-md">
          <MapPin className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="font-medium text-lg mb-2">No Addresses Found</h3>
          <p className="text-gray-500 mb-4">
            Add an address to make checkout faster.
          </p>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus size={16} className="mr-2" />
            Add Address
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses
            .sort((a, b) => {
              // Default address always comes first
              if (a.isDefault && !b.isDefault) return -1;
              if (!a.isDefault && b.isDefault) return 1;
              // For non-default addresses, maintain original order
              return 0;
            })
            .map(address => (
            <Card key={address.id} className={address.isDefault ? "ring-2 ring-blue-200 bg-blue-50/30" : ""}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="font-medium">{address.name}</div>
                    {address.isDefault && (
                      <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">
                        <Star size={12} className="mr-1" />
                        Default
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => handleSetDefault(address.id)}
                      title={address.isDefault ? "Already default address" : "Set as default address"}
                      className={address.isDefault ? "text-blue-600" : "hover:text-blue-600"}
                      disabled={address.isDefault || settingDefaultId === address.id}
                    >
                      {settingDefaultId === address.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      ) : address.isDefault ? (
                        <Star size={16} className="fill-current" />
                      ) : (
                        <StarOff size={16} />
                      )}
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => handleEdit(address)}
                      title="Edit address"
                      className="hover:text-blue-600"
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="text-destructive hover:text-red-700" 
                      onClick={() => handleDelete(address.id)}
                      title="Delete address"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <p>{address.street}</p>
                  <p>{address.city}, {address.state} {address.zipCode}</p>
                  <p>{address.country}</p>
                </div>
                {address.isDefault && (
                  <div className="mt-3 flex items-center gap-1 text-xs text-blue-600">
                    <Check size={12} />
                    This address will be used by default for deliveries
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

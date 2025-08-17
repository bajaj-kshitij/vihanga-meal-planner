import { useState } from "react";
import { Plus, Search, Package, AlertTriangle, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { InventoryCard } from "./InventoryCard";
import { InventoryForm } from "./InventoryForm";
import { InventoryItem, useInventory } from "@/hooks/useInventory";

export const InventoryList = () => {
  const {
    items,
    loading,
    createItem,
    updateItem,
    deleteItem,
    updateStock,
    addStock,
    removeStock,
    getLowStockItems,
    getItemsByCategory,
    initializeUserInventory
  } = useInventory();

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const handleCreateItem = async (itemData: Partial<InventoryItem>) => {
    const result = await createItem(itemData);
    if (result) {
      setShowForm(false);
    }
  };

  const handleUpdateItem = async (itemData: Partial<InventoryItem>) => {
    if (editingItem) {
      const result = await updateItem(editingItem.id, itemData);
      if (result) {
        setEditingItem(null);
        setShowForm(false);
      }
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      await deleteItem(id);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === "all" || item.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const lowStockItems = getLowStockItems();
  const categorizedItems = getItemsByCategory();
  const categories = Object.keys(categorizedItems).sort();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading inventory...</p>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <InventoryForm
        item={editingItem || undefined}
        onSubmit={editingItem ? handleUpdateItem : handleCreateItem}
        onCancel={() => {
          setShowForm(false);
          setEditingItem(null);
        }}
        loading={loading}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground">Track your grocery items and household staples</p>
        </div>
        <div className="flex gap-2">
          {items.length === 0 && (
            <Button onClick={initializeUserInventory} variant="outline" className="gap-2">
              <ShoppingCart className="w-4 h-4" />
              Add Default Items
            </Button>
          )}
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Items</p>
              <p className="text-2xl font-bold">{items.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-sm text-muted-foreground">Low Stock Items</p>
              <p className="text-2xl font-bold text-orange-600">{lowStockItems.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Categories</p>
              <p className="text-2xl font-bold">{categories.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Inventory Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Items ({filteredItems.length})</TabsTrigger>
          <TabsTrigger value="low-stock">Low Stock ({lowStockItems.length})</TabsTrigger>
          <TabsTrigger value="by-category">By Category</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No items found</h3>
              <p className="text-muted-foreground">
                {items.length === 0 
                  ? "Start by adding your first inventory item or initialize with default items!"
                  : "Try adjusting your search or filter criteria."
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <InventoryCard
                  key={item.id}
                  item={item}
                  onUpdateStock={updateStock}
                  onAddStock={addStock}
                  onRemoveStock={removeStock}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="low-stock" className="mt-6">
          {lowStockItems.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">All items are well stocked!</h3>
              <p className="text-muted-foreground">No items are running low or out of stock.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lowStockItems.map((item) => (
                <InventoryCard
                  key={item.id}
                  item={item}
                  onUpdateStock={updateStock}
                  onAddStock={addStock}
                  onRemoveStock={removeStock}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="by-category" className="mt-6">
          <div className="space-y-8">
            {categories.map((category) => (
              <div key={category}>
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-xl font-semibold">{category}</h3>
                  <Badge variant="secondary">{categorizedItems[category].length}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categorizedItems[category]
                    .filter(item => 
                      item.name.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((item) => (
                      <InventoryCard
                        key={item.id}
                        item={item}
                        onUpdateStock={updateStock}
                        onAddStock={addStock}
                        onRemoveStock={removeStock}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
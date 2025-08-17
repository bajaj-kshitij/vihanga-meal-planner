import { InventoryList } from "@/components/InventoryList";

const Inventory = () => {
  return (
    <div className="min-h-screen bg-gradient-gentle">
      <div className="container mx-auto px-6 py-8">
        <InventoryList />
      </div>
    </div>
  );
};

export default Inventory;
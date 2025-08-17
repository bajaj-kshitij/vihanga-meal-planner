import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Edit, Trash2, Users } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { FamilyMemberForm } from "./FamilyMemberForm";
import { useFamilyMembers } from "@/hooks/useFamilyMembers";
import type { FamilyMember } from '@/hooks/useFamilyMembers';

export const FamilyMembersList = () => {
  const { familyMembers, loading, createFamilyMember, updateFamilyMember, deleteFamilyMember } = useFamilyMembers();
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const handleAdd = async (data: Omit<FamilyMember, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    setFormLoading(true);
    const result = await createFamilyMember(data);
    if (result) {
      setShowAddForm(false);
    }
    setFormLoading(false);
  };

  const handleEdit = async (data: Omit<FamilyMember, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!editingMember) return;
    setFormLoading(true);
    const result = await updateFamilyMember(editingMember.id, data);
    if (result) {
      setEditingMember(null);
    }
    setFormLoading(false);
  };

  const handleDelete = async (member: FamilyMember) => {
    await deleteFamilyMember(member.id);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-semibold text-foreground">Family Members</h2>
        </div>
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogTrigger asChild>
            <Button variant="sage">
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <FamilyMemberForm
              onSubmit={handleAdd}
              onCancel={() => setShowAddForm(false)}
              loading={formLoading}
            />
          </DialogContent>
        </Dialog>
      </div>

      {familyMembers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No family members yet</h3>
            <p className="text-muted-foreground mb-4">
              Add family members to start planning meals for everyone
            </p>
            <Button variant="sage" onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Member
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {familyMembers.map((member) => (
            <Card key={member.id} className="hover:shadow-warm transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {member.age && <span>Age {member.age}</span>}
                      {member.role && (
                        <>
                          {member.age && <span>•</span>}
                          <span>{member.role}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {member.dietary_restrictions && member.dietary_restrictions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2">Dietary Restrictions</h4>
                    <div className="flex flex-wrap gap-1">
                      {member.dietary_restrictions.map((restriction, index) => (
                        <Badge key={index} variant="destructive" className="text-xs">
                          {restriction}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {member.preferences && member.preferences.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2">Preferences</h4>
                    <div className="flex flex-wrap gap-1">
                      {member.preferences.map((preference, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {preference}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Dialog open={editingMember?.id === member.id} onOpenChange={(open) => !open && setEditingMember(null)}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setEditingMember(member)}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <FamilyMemberForm
                        member={editingMember!}
                        onSubmit={handleEdit}
                        onCancel={() => setEditingMember(null)}
                        loading={formLoading}
                      />
                    </DialogContent>
                  </Dialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Family Member</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove {member.name} from your family? 
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(member)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
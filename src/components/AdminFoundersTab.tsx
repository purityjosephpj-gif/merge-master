import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Upload } from "lucide-react";

interface Founder {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  image_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  order_index: number;
}

interface AdminFoundersTabProps {
  founders: Founder[];
  showFounderForm: boolean;
  setShowFounderForm: (show: boolean) => void;
  founderForm: any;
  setFounderForm: (form: any) => void;
  uploadingImage: boolean;
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddFounder: (e: React.FormEvent) => void;
  deleteFounder: (id: string, imageUrl: string | null) => void;
}

const AdminFoundersTab = ({
  founders,
  showFounderForm,
  setShowFounderForm,
  founderForm,
  setFounderForm,
  uploadingImage,
  handleImageUpload,
  handleAddFounder,
  deleteFounder,
}: AdminFoundersTabProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Founders Management</CardTitle>
            <CardDescription>Manage founders displayed on the Founders page</CardDescription>
          </div>
          {!showFounderForm && (
            <Button onClick={() => setShowFounderForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Founder
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showFounderForm && (
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleAddFounder} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={founderForm.name}
                      onChange={(e) => setFounderForm({ ...founderForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role *</Label>
                    <Input
                      id="role"
                      value={founderForm.role}
                      onChange={(e) => setFounderForm({ ...founderForm, role: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={founderForm.bio}
                    onChange={(e) => setFounderForm({ ...founderForm, bio: e.target.value })}
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="image">Profile Image</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                    />
                    {uploadingImage && <span className="text-sm text-muted-foreground">Uploading...</span>}
                  </div>
                  {founderForm.image_url && (
                    <img src={founderForm.image_url} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded" />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="linkedin">LinkedIn URL</Label>
                    <Input
                      id="linkedin"
                      type="url"
                      value={founderForm.linkedin_url}
                      onChange={(e) => setFounderForm({ ...founderForm, linkedin_url: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="twitter">Twitter URL</Label>
                    <Input
                      id="twitter"
                      type="url"
                      value={founderForm.twitter_url}
                      onChange={(e) => setFounderForm({ ...founderForm, twitter_url: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="order">Display Order</Label>
                  <Input
                    id="order"
                    type="number"
                    value={founderForm.order_index}
                    onChange={(e) => setFounderForm({ ...founderForm, order_index: parseInt(e.target.value) })}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowFounderForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Founder</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {founders.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No founders added yet</p>
          ) : (
            founders.map((founder) => (
              <Card key={founder.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  {founder.image_url && (
                    <img
                      src={founder.image_url}
                      alt={founder.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{founder.name}</h3>
                    <p className="text-sm text-muted-foreground">{founder.role}</p>
                    {founder.bio && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{founder.bio}</p>
                    )}
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteFounder(founder.id, founder.image_url)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminFoundersTab;
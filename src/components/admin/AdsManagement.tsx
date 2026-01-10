import { useState, useEffect } from "react";
import { 
  Megaphone, Plus, Image, Type, Link, Calendar, Users, 
  Trash2, Edit, MoreVertical, Eye, Clock, Store, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Ad {
  id: string;
  title: string;
  description: string | null;
  type: string;
  image_url: string | null;
  link: string | null;
  bg_color: string | null;
  text_color: string | null;
  start_date: string;
  end_date: string;
  is_active: boolean | null;
  priority: number | null;
  created_at: string | null;
}

const AdsManagement = () => {
  const { toast } = useToast();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'text',
    image_url: '',
    link: '',
    bg_color: '#f97316',
    text_color: '#ffffff',
    start_date: '',
    end_date: '',
  });

  const fetchAds = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setAds(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }

    const adData = {
      title: formData.title,
      description: formData.description || null,
      type: formData.type,
      image_url: formData.image_url || null,
      link: formData.link || null,
      bg_color: formData.bg_color,
      text_color: formData.text_color,
      start_date: formData.start_date || new Date().toISOString(),
      end_date: formData.end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      is_active: true,
    };

    if (editingAd) {
      const { error } = await supabase
        .from('ads')
        .update(adData)
        .eq('id', editingAd.id);

      if (error) {
        toast({ title: "Failed to update ad", variant: "destructive" });
      } else {
        toast({ title: "Ad updated!" });
        fetchAds();
      }
    } else {
      const { error } = await supabase
        .from('ads')
        .insert(adData);

      if (error) {
        toast({ title: "Failed to create ad", variant: "destructive" });
      } else {
        toast({ title: "Ad created!" });
        fetchAds();
      }
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'text',
      image_url: '',
      link: '',
      bg_color: '#f97316',
      text_color: '#ffffff',
      start_date: '',
      end_date: '',
    });
    setEditingAd(null);
    setShowAddDialog(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this ad?')) return;
    
    const { error } = await supabase.from('ads').delete().eq('id', id);

    if (error) {
      toast({ title: "Failed to delete", variant: "destructive" });
    } else {
      toast({ title: "Ad deleted!" });
      fetchAds();
    }
  };

  const toggleAdStatus = async (id: string, currentStatus: boolean | null) => {
    const { error } = await supabase
      .from('ads')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (!error) {
      toast({ title: currentStatus ? "Ad deactivated" : "Ad activated" });
      fetchAds();
    }
  };

  const openEditDialog = (ad: Ad) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      description: ad.description || '',
      type: ad.type,
      image_url: ad.image_url || '',
      link: ad.link || '',
      bg_color: ad.bg_color || '#f97316',
      text_color: ad.text_color || '#ffffff',
      start_date: ad.start_date,
      end_date: ad.end_date,
    });
    setShowAddDialog(true);
  };

  const activeAds = ads.filter(a => a.is_active);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Smart Ads</h3>
          <p className="text-sm text-muted-foreground">
            Create and manage promotional ads
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={(open) => {
          if (!open) resetForm();
          setShowAddDialog(open);
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              Create Ad
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingAd ? 'Edit Ad' : 'Create New Ad'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Title *</label>
                <Input
                  placeholder="Ad title..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  placeholder="Ad description..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Type</label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="text">Text Only</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="banner">Banner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Link URL</label>
                  <Input
                    placeholder="https://..."
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  />
                </div>
              </div>
              {formData.type !== 'text' && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Image URL</label>
                  <Input
                    placeholder="https://..."
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Background Color</label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.bg_color}
                      onChange={(e) => setFormData({ ...formData, bg_color: e.target.value })}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={formData.bg_color}
                      onChange={(e) => setFormData({ ...formData, bg_color: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Text Color</label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.text_color}
                      onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={formData.text_color}
                      onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Start Date</label>
                  <Input
                    type="date"
                    value={formData.start_date ? formData.start_date.split('T')[0] : ''}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">End Date</label>
                  <Input
                    type="date"
                    value={formData.end_date ? formData.end_date.split('T')[0] : ''}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>

              {/* Preview */}
              <div>
                <label className="text-sm font-medium mb-2 block">Preview</label>
                <div 
                  className="rounded-xl p-4 text-center"
                  style={{ backgroundColor: formData.bg_color, color: formData.text_color }}
                >
                  <p className="font-semibold">{formData.title || 'Your Ad Title'}</p>
                  {formData.description && (
                    <p className="text-sm opacity-80 mt-1">{formData.description}</p>
                  )}
                </div>
              </div>

              <Button onClick={handleSubmit} className="w-full">
                {editingAd ? 'Update Ad' : 'Create Ad'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-4 border">
          <div className="flex items-center gap-2 text-orange-600 mb-1">
            <Megaphone className="h-4 w-4" />
            <span className="text-xs font-medium">Total Ads</span>
          </div>
          <p className="text-2xl font-bold">{ads.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <Eye className="h-4 w-4" />
            <span className="text-xs font-medium">Active</span>
          </div>
          <p className="text-2xl font-bold">{activeAds.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Clock className="h-4 w-4" />
            <span className="text-xs font-medium">Scheduled</span>
          </div>
          <p className="text-2xl font-bold">0</p>
        </div>
      </div>

      {/* Ads List */}
      <div className="bg-white rounded-2xl border overflow-hidden">
        <div className="p-4 border-b bg-gradient-to-r from-orange-50 to-white">
          <h3 className="font-semibold">All Ads</h3>
        </div>
        <div className="divide-y max-h-[500px] overflow-y-auto">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="p-4">
                <Skeleton className="h-20" />
              </div>
            ))
          ) : ads.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Megaphone className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>No ads created yet</p>
            </div>
          ) : (
            ads.map(ad => (
              <div key={ad.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div 
                    className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: ad.bg_color || '#f97316' }}
                  >
                    {ad.type === 'image' && ad.image_url ? (
                      <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <Type className="h-6 w-6" style={{ color: ad.text_color || '#fff' }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{ad.title}</p>
                      <Badge className={cn(
                        "text-xs",
                        ad.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                      )}>
                        {ad.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    {ad.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1">{ad.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                      <span className="flex items-center gap-1 capitalize">
                        {ad.type === 'image' ? <Image className="h-3 w-3" /> : <Type className="h-3 w-3" />}
                        {ad.type}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(ad.end_date), 'MMM d')}
                      </span>
                      {ad.link && (
                        <span className="flex items-center gap-1">
                          <Link className="h-3 w-3" />
                          Has link
                        </span>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white">
                      <DropdownMenuItem onClick={() => toggleAdStatus(ad.id, ad.is_active)}>
                        <Eye className="h-4 w-4 mr-2" />
                        {ad.is_active ? 'Deactivate' : 'Activate'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEditDialog(ad)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(ad.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdsManagement;

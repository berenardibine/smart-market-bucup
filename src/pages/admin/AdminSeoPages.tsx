import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Edit, Eye, Save, Code, Type, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdmin } from "@/hooks/useAdmin";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface SitePage {
  id: string;
  slug: string;
  title: string;
  meta_description: string | null;
  content: string;
  is_published: boolean;
  updated_at: string | null;
}

const AdminSeoPages = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { user } = useAuth();
  const { toast } = useToast();
  const [pages, setPages] = useState<SitePage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState<SitePage | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isHtmlMode, setIsHtmlMode] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '', meta_description: '', content: '', is_published: true,
  });

  useEffect(() => {
    if (isAdmin) fetchPages();
  }, [isAdmin]);

  const fetchPages = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('site_pages')
      .select('*')
      .order('created_at');
    if (data) setPages(data as SitePage[]);
    setLoading(false);
  };

  const openEditor = (page: SitePage) => {
    setEditingPage(page);
    setFormData({
      title: page.title,
      meta_description: page.meta_description || '',
      content: page.content,
      is_published: page.is_published,
    });
    setShowEditor(true);
    setShowPreview(false);
  };

  const handleSave = async () => {
    if (!editingPage) return;
    setSaving(true);

    const { error } = await supabase
      .from('site_pages')
      .update({
        title: formData.title,
        meta_description: formData.meta_description,
        content: formData.content,
        is_published: formData.is_published,
        updated_at: new Date().toISOString(),
        updated_by: user?.id,
      })
      .eq('id', editingPage.id);

    if (error) {
      toast({ title: "Failed to save", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Page saved!" });
      fetchPages();
      setShowEditor(false);
    }
    setSaving(false);
  };

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAdmin) { navigate('/'); return null; }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-50 bg-background border-b">
        <div className="flex items-center gap-3 p-4">
          <button onClick={() => navigate('/admin')} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-semibold text-lg">SEO & Legal Pages</h1>
            <p className="text-xs text-muted-foreground">Edit website pages in HTML</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {loading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
        ) : (
          pages.map(page => (
            <div key={page.id} className="bg-card rounded-2xl border p-4 hover:shadow-md transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{page.title}</h3>
                    <Badge className={page.is_published ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-muted text-muted-foreground"}>
                      {page.is_published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">{page.meta_description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      /page/{page.slug}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => navigate(`/page/${page.slug}`)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" onClick={() => openEditor(page)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="bg-card max-w-2xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit: {editingPage?.slug}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Page Title</Label>
              <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
            </div>
            <div>
              <Label>Meta Description (SEO)</Label>
              <Textarea value={formData.meta_description} onChange={e => setFormData({ ...formData, meta_description: e.target.value })} rows={2} placeholder="Under 160 chars for SEO..." />
              <p className="text-xs text-muted-foreground mt-1">{formData.meta_description.length}/160 chars</p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Content</Label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-muted rounded-lg p-0.5">
                    <button onClick={() => { setIsHtmlMode(false); setShowPreview(false); }}
                      className={cn("flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors", !isHtmlMode ? 'bg-background shadow-sm' : 'text-muted-foreground')}>
                      <Type className="h-3 w-3" /> Text
                    </button>
                    <button onClick={() => setIsHtmlMode(true)}
                      className={cn("flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors", isHtmlMode ? 'bg-background shadow-sm' : 'text-muted-foreground')}>
                      <Code className="h-3 w-3" /> HTML
                    </button>
                  </div>
                  {isHtmlMode && (
                    <button onClick={() => setShowPreview(!showPreview)}
                      className={cn("flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors", showPreview ? 'bg-primary/10 text-primary border-primary/20' : 'text-muted-foreground border-border')}>
                      <Eye className="h-3 w-3" /> Preview
                    </button>
                  )}
                </div>
              </div>
              {showPreview ? (
                <div className="rounded-lg border p-4 min-h-[300px] bg-background overflow-auto">
                  <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: formData.content }} />
                </div>
              ) : (
                <Textarea
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  rows={15}
                  className={isHtmlMode ? 'font-mono text-xs' : ''}
                  placeholder="Write page content..."
                />
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch checked={formData.is_published} onCheckedChange={v => setFormData({ ...formData, is_published: v })} />
                <Label>Published</Label>
              </div>
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Page'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSeoPages;

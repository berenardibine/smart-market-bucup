import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, Send, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
}

interface ProductCommentsProps {
  productId: string;
}

// Get or create session ID for guests
const getSessionId = (): string => {
  const key = 'smart_market_session_id';
  let sessionId = localStorage.getItem(key);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(key, sessionId);
  }
  return sessionId;
};

const ProductComments = ({ productId }: ProductCommentsProps) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [showForm, setShowForm] = useState(false);

  const sessionId = getSessionId();

  const fetchComments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('product_comments')
        .select('id, author_name, content, created_at')
        .eq('product_id', productId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  useEffect(() => {
    if (profile?.full_name) {
      setAuthorName(profile.full_name);
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedComment = newComment.trim();
    const trimmedName = authorName.trim();

    if (!trimmedComment || !trimmedName) {
      toast({ title: 'Please fill in your name and comment', variant: 'destructive' });
      return;
    }

    if (trimmedComment.length < 5) {
      toast({ title: 'Comment must be at least 5 characters', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl('');
      const baseUrl = publicUrl.replace('/storage/v1/object/public/products/', '');
      
      const response = await fetch(`${baseUrl}/functions/v1/submit-comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRieWtydWxmemhoa210Z2podmpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NjgxNTksImV4cCI6MjA4MDQ0NDE1OX0.Bm5bMN6QGgXeF2EOvmF7nmNBksmrPCLTkcXy-bXWiV0'
        },
        body: JSON.stringify({
          productId,
          sessionId,
          userId: user?.id || null,
          authorName: trimmedName,
          content: trimmedComment
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setNewComment('');
        setShowForm(false);
        fetchComments();
        toast({ title: 'Comment posted successfully!' });
      } else {
        throw new Error(result.error || 'Failed to post comment');
      }
    } catch (error: any) {
      toast({ title: 'Failed to post comment', description: error.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          Comments ({comments.length})
        </h3>
        {!showForm && (
          <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
            Add Comment
          </Button>
        )}
      </div>

      {/* Comment Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-muted/50 rounded-xl p-4 space-y-3">
          {!user && (
            <Input
              placeholder="Your name"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="bg-background"
            />
          )}
          <Textarea
            placeholder="Share your thoughts about this product..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            className="bg-background resize-none"
          />
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-1" />}
              Post
            </Button>
          </div>
        </form>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-card border rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {comment.author_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{comment.author_name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{comment.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductComments;

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  HardDrive, 
  Zap, 
  Image, 
  TrendingDown, 
  RefreshCw, 
  Play,
  Eye,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  FileImage,
  Trash2,
  RotateCcw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useFileOptimization } from "@/hooks/useFileOptimization";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface OptimizationLog {
  id: string;
  original_url: string;
  optimized_url: string;
  original_size: number;
  optimized_size: number;
  compression_ratio: number;
  was_enhanced: boolean;
  target_type: string;
  created_at: string;
}

interface BatchJob {
  id: string;
  files_processed: number;
  files_failed: number;
  files_skipped: number;
  space_saved: number;
  compression_ratio: number;
  status: string;
  created_at: string;
}

interface ProductFile {
  productId: string;
  productTitle: string;
  imageUrl: string;
  isOptimized: boolean;
  estimatedSize: string;
}

const FileOptimizationDashboard = () => {
  const { toast } = useToast();
  const { optimizeFile, runBatchOptimization, getOptimizationStats, isOptimizing, progress } = useFileOptimization();
  
  const [stats, setStats] = useState({
    totalFiles: 0,
    spaceSaved: 0,
    avgCompression: 0,
    filesEnhanced: 0,
    unoptimizedProducts: 0,
    optimizedProducts: 0
  });
  const [recentLogs, setRecentLogs] = useState<OptimizationLog[]>([]);
  const [batchJobs, setBatchJobs] = useState<BatchJob[]>([]);
  const [productFiles, setProductFiles] = useState<ProductFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [optimizingSingle, setOptimizingSingle] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'files' | 'logs'>('overview');

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch stats
      const statsResult = await getOptimizationStats();
      
      // Fetch all products with images
      const { data: products } = await supabase
        .from('products')
        .select('id, title, images')
        .not('images', 'is', null);
      
      const allFiles: ProductFile[] = [];
      let optimizedCount = 0;
      let unoptimizedCount = 0;
      
      (products || []).forEach(p => {
        const images = p.images as string[] || [];
        images.forEach(img => {
          const isOpt = img.includes('/optimized/') || img.includes('optimized_');
          if (isOpt) optimizedCount++;
          else unoptimizedCount++;
          
          allFiles.push({
            productId: p.id,
            productTitle: p.title,
            imageUrl: img,
            isOptimized: isOpt,
            estimatedSize: isOpt ? '< 500KB' : '> 500KB'
          });
        });
      });
      
      setProductFiles(allFiles);

      if (statsResult) {
        setStats({
          totalFiles: statsResult.totalFilesProcessed,
          spaceSaved: statsResult.totalSpaceSaved,
          avgCompression: statsResult.averageCompression,
          filesEnhanced: statsResult.filesEnhanced,
          unoptimizedProducts: unoptimizedCount,
          optimizedProducts: optimizedCount
        });
      } else {
        setStats(prev => ({ 
          ...prev, 
          unoptimizedProducts: unoptimizedCount,
          optimizedProducts: optimizedCount
        }));
      }

      // Fetch recent logs
      const { data: logs } = await supabase
        .from('file_optimization_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (logs) setRecentLogs(logs);

      // Fetch batch jobs
      const { data: jobs } = await supabase
        .from('batch_optimization_jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (jobs) setBatchJobs(jobs);
    } catch (error) {
      console.error('Failed to fetch optimization data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOptimizeSingle = async (file: ProductFile) => {
    setOptimizingSingle(file.imageUrl);
    try {
      const result = await optimizeFile(file.imageUrl, 'product_card', true);
      
      if (result?.optimizedUrl) {
        // Update the product's images array in database
        const { data: product } = await supabase
          .from('products')
          .select('images')
          .eq('id', file.productId)
          .single();
        
        if (product) {
          const images = (product.images as string[]) || [];
          const updatedImages = images.map(img => 
            img === file.imageUrl ? result.optimizedUrl : img
          );
          
          await supabase
            .from('products')
            .update({ images: updatedImages })
            .eq('id', file.productId);
        }
        
        toast({
          title: "File Optimized",
          description: `Saved ${result.compressionRatio}% - ${formatBytes(result.originalSize - result.optimizedSize)}`,
        });
        
        fetchData();
      }
    } catch (error) {
      toast({
        title: "Optimization Failed",
        description: "Could not optimize this file",
        variant: "destructive"
      });
    } finally {
      setOptimizingSingle(null);
    }
  };

  const handleOptimizeAll = async () => {
    const result = await runBatchOptimization(100, 100000, false);
    if (result) {
      toast({
        title: "Batch Optimization Complete",
        description: `Processed ${result.filesProcessed || 0} files`,
      });
      fetchData();
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileName = (url: string) => {
    return url.split('/').pop()?.slice(0, 30) || 'Unknown';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            File Optimization System
          </h2>
          <p className="text-muted-foreground">
            Compress, optimize, and enhance all media files
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleOptimizeAll} disabled={isOptimizing}>
            {isOptimizing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            Optimize All Files
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      {isOptimizing && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Batch Optimization in Progress...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 rounded-xl bg-primary/10 mb-2">
                <Image className="h-5 w-5 text-primary" />
              </div>
              <p className="text-xl font-bold">{stats.totalFiles}</p>
              <p className="text-xs text-muted-foreground">Files Processed</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 rounded-xl bg-green-500/10 mb-2">
                <HardDrive className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-xl font-bold">{formatBytes(stats.spaceSaved)}</p>
              <p className="text-xs text-muted-foreground">Space Saved</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 rounded-xl bg-blue-500/10 mb-2">
                <TrendingDown className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-xl font-bold">{stats.avgCompression}%</p>
              <p className="text-xs text-muted-foreground">Avg Compression</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 rounded-xl bg-purple-500/10 mb-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
              </div>
              <p className="text-xl font-bold">{stats.filesEnhanced}</p>
              <p className="text-xs text-muted-foreground">AI Enhanced</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 rounded-xl bg-emerald-500/10 mb-2">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              </div>
              <p className="text-xl font-bold">{stats.optimizedProducts}</p>
              <p className="text-xs text-muted-foreground">Optimized</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 rounded-xl bg-red-500/10 mb-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <p className="text-xl font-bold">{stats.unoptimizedProducts}</p>
              <p className="text-xs text-muted-foreground">Unoptimized</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('files')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'files' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
          }`}
        >
          All Files ({productFiles.length})
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'logs' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
          }`}
        >
          Optimization Logs
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Batch Jobs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Batch Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              {batchJobs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No batch jobs yet</p>
              ) : (
                <div className="space-y-3">
                  {batchJobs.slice(0, 5).map(job => (
                    <div 
                      key={job.id}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        {job.status === 'completed' ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-yellow-500" />
                        )}
                        <div>
                          <p className="font-medium text-sm">{job.files_processed} files processed</p>
                          <p className="text-xs text-muted-foreground">{formatDate(job.created_at)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={job.compression_ratio > 50 ? "default" : "secondary"}>
                          {job.compression_ratio || 0}% saved
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatBytes(job.space_saved || 0)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Unoptimized Files Quick View */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Unoptimized Files</span>
                <Badge variant="destructive">{stats.unoptimizedProducts}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {productFiles.filter(f => !f.isOptimized).length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <p className="text-muted-foreground">All files are optimized!</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {productFiles.filter(f => !f.isOptimized).slice(0, 10).map((file, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center gap-3 p-2 bg-red-500/5 rounded-lg"
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0">
                        <img src={file.imageUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.productTitle}</p>
                        <p className="text-xs text-muted-foreground">{file.estimatedSize}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOptimizeSingle(file)}
                        disabled={optimizingSingle === file.imageUrl}
                      >
                        {optimizingSingle === file.imageUrl ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Zap className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'files' && (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Preview</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>File Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Est. Size</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productFiles.slice(0, 50).map((file, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                        <img 
                          src={file.imageUrl} 
                          alt="" 
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium max-w-[150px] truncate">
                      {file.productTitle}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate">
                      {getFileName(file.imageUrl)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={file.isOptimized ? "default" : "destructive"}>
                        {file.isOptimized ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Optimized
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Unoptimized
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{file.estimatedSize}</TableCell>
                    <TableCell>
                      {!file.isOptimized && (
                        <Button
                          size="sm"
                          onClick={() => handleOptimizeSingle(file)}
                          disabled={optimizingSingle === file.imageUrl}
                        >
                          {optimizingSingle === file.imageUrl ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Zap className="h-4 w-4 mr-1" />
                              Optimize
                            </>
                          )}
                        </Button>
                      )}
                      {file.isOptimized && (
                        <span className="text-xs text-muted-foreground">Already optimized</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {productFiles.length > 50 && (
              <p className="text-center text-muted-foreground text-sm py-4">
                Showing 50 of {productFiles.length} files
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'logs' && (
        <Card>
          <CardContent className="pt-6">
            {recentLogs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No optimizations yet. Upload files to see them here.
              </p>
            ) : (
              <div className="space-y-3">
                {recentLogs.map(log => (
                  <div 
                    key={log.id}
                    className="flex items-center gap-4 p-3 bg-muted/30 rounded-xl"
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img 
                        src={log.optimized_url} 
                        alt="" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {log.target_type}
                        </Badge>
                        {log.was_enhanced && (
                          <Badge variant="secondary" className="text-xs">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Enhanced
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatBytes(log.original_size)} → {formatBytes(log.optimized_size)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(log.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-500">
                        -{log.compression_ratio}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FileOptimizationDashboard;
